import * as https from 'https';
import * as http from 'http';
import { EventEmitter } from 'events';

/**
 * A minimal EventSource implementation for Node.js using native https module.
 * This is created because the 'eventsource' library v4.1.0 fails to send headers correctly
 * in this environment, causing 401 errors with the MCP server.
 */
export class NodeEventSource extends EventEmitter {
  private req: http.ClientRequest | null = null;
  private res: http.IncomingMessage | null = null;
  private buffer: string = '';
  public readyState: number = 0; // 0=CONNECTING, 1=OPEN, 2=CLOSED
  public url: string;
  public withCredentials: boolean = false;

  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSED = 2;

  constructor(url: string, options: any = {}) {
    super();
    this.url = url;
    this.readyState = 0;
    this.connect(url, options);
  }

  private connect(url: string, options: any) {
    const headers = options.headers || {};
    // Ensure Accept header is set
    headers['Accept'] = 'text/event-stream';
    
    // Copy options to https request options
    const reqOptions: https.RequestOptions = {
        headers: headers,
        agent: options.https?.agent,
        rejectUnauthorized: options.https?.rejectUnauthorized,
        ...options.https
    };

    console.log(`[NodeEventSource] Connecting to ${url}`);

    this.req = https.get(url, reqOptions, (res) => {
        this.res = res;
        
        if (res.statusCode !== 200) {
            console.error(`[NodeEventSource] Error: ${res.statusCode} ${res.statusMessage}`);
            const err = new Error(`Non-200 status code (${res.statusCode})`);
            (err as any).status = res.statusCode;
            // Emit error event like standard EventSource
            const errorEvent = { type: 'error', message: err.message, status: res.statusCode };
            this.emit('error', errorEvent);
            this.close();
            return;
        }

        this.readyState = 1;
        this.emit('open', { type: 'open' });

        res.on('data', (chunk) => {
            this.buffer += chunk.toString();
            this.parseBuffer();
        });

        res.on('end', () => {
            this.readyState = 2;
            // Standard EventSource tries to reconnect, but for MCP we often just close or let SDK handle reconnect
            // We'll treat end as close/error
            this.emit('error', { type: 'error', message: 'Connection closed by server' });
            this.close();
        });
    });

    this.req.on('error', (err: Error) => {
        console.error(`[NodeEventSource] Request Error: ${err.message}`);
        this.emit('error', { type: 'error', message: err.message });
        this.close();
    });
  }

  private parseBuffer() {
    // Normalize newlines to \n to handle \r\n or \r from different servers/proxies
    const normalized = this.buffer.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    
    // SSE messages are separated by double newline
    const parts = normalized.split('\n\n');
    
    // If the buffer ends with \n\n, the last part is empty string, which means we have a complete message.
    // If it doesn't, the last part is incomplete.
    
    // Note: We need to handle the case where normalized might differ from buffer length for next chunk? 
    // Actually, converting buffer to string and normalizing every time is inefficient but fine for this scale.
    // BUT we must be careful: if we modify 'normalized', we can't easily put back the "incomplete" part into 'this.buffer' 
    // because 'this.buffer' might still have \r\n.
    
    // Better approach: Regex split on original buffer?
    // Or just clear buffer and process 'normalized'.
    
    // Let's assume we process 'normalized'.
    // The issue is: if we receive "event: foo\r", we wait for "\n". 
    // If we replace \r with \n, we get "event: foo\n". 
    // Then we wait for next \n.
    
    // Let's stick to the simple logic but normalize FIRST.
    // Limitation: If a chunk ends exactly in middle of \r\n, we might have issues. 
    // But text/event-stream usually aligns well or node http handles it?
    
    // Let's try splitting by regex that matches double newlines.
    const partsRegex = this.buffer.split(/\r\n\r\n|\r\r|\n\n/);
    
    // The last part is potentially incomplete
    const lastPart = partsRegex.pop();
    
    // If the original buffer ended with a delimiter, lastPart would be empty string.
    // If it didn't, lastPart is the partial data.
    this.buffer = lastPart || '';

    for (const part of partsRegex) {
        if (!part.trim()) continue;
        
        const lines = part.split(/\r\n|\r|\n/);
        let eventType = 'message';
        let data = '';
        let id = '';

        for (const line of lines) {
            if (line.startsWith('event: ')) {
                eventType = line.substring(7).trim();
            } else if (line.startsWith('data: ')) {
                data += line.substring(6);
                data += '\n'; 
            } else if (line.startsWith('id: ')) {
                id = line.substring(4).trim();
            }
        }

        if (data.endsWith('\n')) data = data.slice(0, -1);

        const event = {
            type: eventType,
            data: data,
            lastEventId: id
        };

        if (eventType === 'message' && data) {
             this.emit('message', event);
        }
        
        if (eventType !== 'message') {
            this.emit(eventType, event);
        }
    }
  }

  public close() {
    this.readyState = 2;
    if (this.res) this.res.destroy();
    if (this.req) this.req.destroy();
    this.req = null;
    this.res = null;
  }
  
  // Shim for EventTarget interface used by MCP SDK
  public addEventListener(type: string, listener: any) {
      this.on(type, listener);
  }
  
  public removeEventListener(type: string, listener: any) {
      this.off(type, listener);
  }
}