import Link from 'next/link';
import React from 'react';
import { XIcon } from '@/components/icons/XIcon';

const Footer = () => {
  return (
    <footer className="bg-background border-t mt-auto">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Column */}
          <div className="md:col-span-1">
            <h3 className="text-xl font-bold font-headline">
                <span className="text-foreground">Gamma</span><span className="text-primary">Rips</span>
            </h3>
            <p className="text-sm text-muted-foreground mt-2">
              Institutional overnight options flow data, technical analysis, and AI-generated market insights.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Product</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/signals" className="text-muted-foreground hover:text-primary transition-colors">
                  Signals
                </Link>
              </li>
              <li>
                <Link href="/reports" className="text-muted-foreground hover:text-primary transition-colors">
                  Reports
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-muted-foreground hover:text-primary transition-colors">
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Company</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-primary transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="text-muted-foreground hover:text-primary transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/scorecard" className="text-muted-foreground hover:text-primary transition-colors">
                  Scorecard
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Connect */}
          <div>
             <div className="mb-6">
                <h4 className="font-semibold text-foreground mb-4">Legal</h4>
                <ul className="space-y-3 text-sm">
                  <li>
                    <Link href="/privacy" className="text-muted-foreground hover:text-primary transition-colors">
                      Privacy Policy
                    </Link>
                  </li>
                  <li>
                    <Link href="/terms" className="text-muted-foreground hover:text-primary transition-colors">
                      Terms of Service
                    </Link>
                  </li>
                </ul>
             </div>
             <div>
                 <h4 className="font-semibold text-foreground mb-4">Connect</h4>
                 <ul className="space-y-3 text-sm">
                  <li>
                    <a 
                      href="https://x.com/GammaRips" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
                    >
                      X (@GammaRips)
                    </a>
                  </li>
                  <li>
                    <a 
                      href="mailto:support@gammarips.com" 
                      className="text-muted-foreground hover:text-primary transition-colors"
                    >
                      support@gammarips.com
                    </a>
                  </li>
                   <li>
                    <Link href="/developers" className="text-muted-foreground hover:text-primary transition-colors">
                      Developers (MCP API)
                    </Link>
                  </li>
                </ul>
             </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 border-t pt-8">
          <p className="text-xs text-muted-foreground leading-relaxed mb-6">
            <strong>Disclaimer:</strong> The information provided by GammaRips is for informational purposes only and does not constitute investment advice, financial advice, trading advice, or any other sort of advice. You should not treat any of the website's content as such. GammaRips does not recommend that any securities, options, or strategies are suitable for any particular investor. You are solely responsible for your own investment decisions. Past performance is not indicative of future results.
          </p>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} GammaRips. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
