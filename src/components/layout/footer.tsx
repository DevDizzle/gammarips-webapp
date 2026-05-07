import Link from 'next/link';
import React from 'react';
import { XIcon } from '@/components/icons/XIcon';

const Footer = () => {
  return (
    <footer className="bg-background border-t mt-auto relative z-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold font-headline">
                <span className="text-foreground">Gamma</span><span className="text-primary">Rips</span>
            </h3>
            <p className="text-sm text-muted-foreground mt-2">One options trade a day. Pushed to your phone at 7:30 AM ET.</p>
          </div>
          <div>
            <h4 className="font-semibold text-foreground">Product</h4>
            <ul className="mt-4 space-y-2 text-sm">
              <li><Link href="/" className="text-muted-foreground hover:text-primary">Home</Link></li>
              <li><Link href="/signals" className="text-muted-foreground hover:text-primary">Signals</Link></li>
              <li><Link href="/pricing" className="text-muted-foreground hover:text-primary">Pricing</Link></li>
              <li><Link href="/developers" className="text-muted-foreground hover:text-primary">Developers</Link></li>
              <li><Link href="/llms.txt" className="text-muted-foreground hover:text-primary">llms.txt</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-foreground">Company</h4>
            <ul className="mt-4 space-y-2 text-sm">
              <li><Link href="/about" className="text-muted-foreground hover:text-primary">About</Link></li>
              <li><Link href="/how-it-works" className="text-muted-foreground hover:text-primary">How It Works</Link></li>
              <li><Link href="/methodology" className="text-muted-foreground hover:text-primary">Methodology</Link></li>
              <li><Link href="/scorecard" className="text-muted-foreground hover:text-primary">Scorecard</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-foreground">Legal &amp; Connect</h4>
            <ul className="mt-4 space-y-2 text-sm">
              <li><Link href="/disclosures" className="text-muted-foreground hover:text-primary">Disclosures</Link></li>
              <li><Link href="/privacy" className="text-muted-foreground hover:text-primary">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-muted-foreground hover:text-primary">Terms of Service</Link></li>
              <li><a href="https://x.com/GammaRips" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary flex items-center gap-2"><XIcon className="h-4 w-4" /> @GammaRips</a></li>
              <li><a href="mailto:evan@gammarips.com" className="text-muted-foreground hover:text-primary">evan@gammarips.com</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t pt-8">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>Disclaimer:</strong> The information provided by GammaRips is for informational purposes only and does not constitute investment advice, financial advice, trading advice, or any other sort of advice. You should not treat any of the website&apos;s content as such. GammaRips does not recommend that any security should be bought, sold, or held by you. Do conduct your own due diligence and consult your financial advisor before making any investment decisions. All investments involve risk and the past performance of a security or financial product does not guarantee future results or returns.
          </p>
          <p className="text-center text-sm text-muted-foreground mt-6">&copy; {new Date().getFullYear()} GammaRips. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
