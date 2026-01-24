'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Activity } from 'lucide-react';
import type { MarketStructure } from '@/lib/types/dashboard-v2';

type ActiveContract = MarketStructure['top_active_contracts'][0];

export const ActiveContracts = ({ contracts }: { contracts: ActiveContract[] }) => {
    if (!contracts || contracts.length === 0) {
        return null;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2 font-headline">
                    <Activity className="text-muted-foreground" />
                    Most Active Contracts
                </CardTitle>
                <CardDescription>
                    The most traded options contracts for this stock today, indicating high trader interest or institutional positioning.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {/* Desktop Table */}
                <div className="hidden md:block">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Contract</TableHead>
                                <TableHead className="text-right">Volume</TableHead>
                                <TableHead className="text-right">Open Interest</TableHead>
                                <TableHead className="text-right">Last Price</TableHead>
                                <TableHead className="text-right">Implied Vol.</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {contracts.map((contract, index) => (
                                <TableRow key={index}>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-semibold">${contract.strike.toFixed(2)} {contract.option_type.toUpperCase()}</span>
                                            <span className="text-xs text-muted-foreground">
                                                Expires: {new Date(contract.expiration_date).toLocaleDateString('en-US', { timeZone: 'UTC', month: 'short', day: 'numeric', year: 'numeric' })}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right font-mono">{contract.volume.toLocaleString()}</TableCell>
                                    <TableCell className="text-right font-mono">{contract.open_interest.toLocaleString()}</TableCell>
                                    <TableCell className="text-right font-mono">${contract.last_price.toFixed(2)}</TableCell>
                                    <TableCell className="text-right font-mono">{(contract.implied_volatility * 100).toFixed(1)}%</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
                 {/* Mobile Cards */}
                <div className="md:hidden space-y-4">
                    {contracts.map((contract, index) => (
                        <Card key={index} className="bg-background/50">
                            <CardContent className="p-4 space-y-3">
                                <div className="flex justify-between items-start">
                                    <div className="flex flex-col">
                                        <span className="font-semibold">${contract.strike.toFixed(2)} {contract.option_type.toUpperCase()}</span>
                                        <span className="text-xs text-muted-foreground">
                                            Expires: {new Date(contract.expiration_date).toLocaleDateString('en-US', { timeZone: 'UTC', month: 'short', day: 'numeric' })}
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold font-mono">${contract.last_price.toFixed(2)}</p>
                                        <p className="text-xs text-muted-foreground">Last Price</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-2 text-center text-sm border-t pt-3">
                                     <div>
                                        <p className="text-xs text-muted-foreground">Volume</p>
                                        <p className="font-semibold font-mono">{contract.volume.toLocaleString()}</p>
                                    </div>
                                     <div>
                                        <p className="text-xs text-muted-foreground">Open Int.</p>
                                        <p className="font-semibold font-mono">{contract.open_interest.toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Imp. Vol.</p>
                                        <p className="font-semibold font-mono">{(contract.implied_volatility * 100).toFixed(1)}%</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};
