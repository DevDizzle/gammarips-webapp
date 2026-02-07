import Link from 'next/link';
import React from 'react';
import { XIcon } from '@/components/icons/XIcon';

const Footer = () => {
  return (
    <footer className="bg-background border-t mt-auto">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          <div className="md:col-span-2">
            <h3 className="text-xl font-bold font-headline">
                <span className="text-foreground">Gamma</span><span className="text-primary">Rips</span>
            </h3>
            <p className="text-sm text-muted-foreground mt-2">AI-Powered Research for Options Traders</p>
          </div>
          <div>
            <h4 className="font-semibold text-foreground">Navigate</h4>
            <ul className="mt-4 space-y-2 text-sm">
              <li><Link href="/" className="text-muted-foreground hover:text-primary transition-colors">Home</Link></li>
              <li><Link href="/weekly-picks" className="text-muted-foreground hover:text-primary transition-colors">Weekly Picks</Link></li>
              <li><Link href="/learn" className="text-muted-foreground hover:text-primary transition-colors">Learn</Link></li>
              <li><Link href="/blog" className="text-muted-foreground hover:text-primary transition-colors">Blog</Link></li>
              <li><Link href="/developers" className="text-muted-foreground hover:text-primary transition-colors">Developers</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-foreground">Legal</h4>
            <ul className="mt-4 space-y-2 text-sm">
              <li><Link href="/about" className="text-muted-foreground hover:text-primary transition-colors">About Us</Link></li>
              <li><Link href="/privacy" className="text-muted-foreground hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-muted-foreground hover:text-primary transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
          <div>
             <h4 className="font-semibold text-foreground">Follow Us</h4>
            <ul className="mt-4 space-y-2 text-sm">
              <li><a href="https://x.com/GammaRips" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors flex items-center gap-2">X (formerly Twitter)</a></li>
              <li><a href="/about#contact" className="text-muted-foreground hover:text-primary transition-colors">Contact Us</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t pt-8">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>Disclaimer:</strong> The information provided by GammaRips is for informational purposes only and does not constitute investment advice, financial advice, trading advice, or any other sort of advice. You should not treat any of the website's content as such. GammaRips does not recommend that any security should be bought, sold, or held by you. Do conduct your own due diligence and consult your financial advisor before making any investment decisions. All investments involve risk and the past performance of a security or financial product does not guarantee future results or returns.
          </p>
          <p className="text-center text-sm text-muted-foreground mt-6">&copy; {new Date().getFullYear()} GammaRips. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;