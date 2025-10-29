"use client";

import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { mockApi } from '@/lib/mockApi';

interface ProfileCardProps {
  totalGoals: number;
  totalSolLocked: number;
  onCreateGoal: () => void;
  onViewHistory: () => void;
}

export const ProfileCard = ({
  totalGoals,
  totalSolLocked,
  onCreateGoal,
  onViewHistory,
}: ProfileCardProps) => {
  const wallet = useWallet(); // ✅ Get full wallet object
  const [mounted, setMounted] = useState(false);
  const [hasActiveGoal, setHasActiveGoal] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const checkActiveGoal = async () => {
      if (wallet.publicKey) {
        try {
          const active = await mockApi.hasActiveGoal(wallet.publicKey.toString());
          setHasActiveGoal(active);
        } catch (error) {
          console.log('Error checking active goal:', error);
          setHasActiveGoal(false);
        }
      }
    };

    checkActiveGoal();
  }, [wallet.publicKey, totalGoals]);

  // ✅ Show loading state until mounted
  if (!mounted) {
    return (
      <Card className="p-6 shadow-lg border-border/50">
        <div className="space-y-6">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-3xl animate-pulse">
              👤
            </div>
            <div className="h-4 w-32 bg-muted animate-pulse rounded"></div>
          </div>
        </div>
      </Card>
    );
  }

  // ✅ Now access wallet properties
  const { publicKey, connected } = wallet;

  return (
    <Card className="p-6 shadow-lg border-border/50">
      <div className="space-y-6">
        {/* Profile Avatar & Wallet */}
        <div className="flex flex-col items-center space-y-4">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-3xl">
            {connected ? '🎯' : '👤'}
          </div>
          
          <div>
            {connected && publicKey ? (
              <p className="text-sm font-mono text-muted-foreground">
                {publicKey.toBase58().slice(0, 4)}...{publicKey.toBase58().slice(-4)}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">Not connected</p>
            )}
          </div>

          {/* Wallet Connect Button */}
          <div className="flex justify-center w-full">
            <WalletMultiButton className="!bg-primary !text-primary-foreground hover:!bg-primary/90" />
          </div>
        </div>

        {/* Stats - NOW IN RED */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
          <div className="text-center">
            <p className="text-2xl font-bold text-red-500">
              {totalGoals}
            </p>
            <p className="text-xs text-muted-foreground">Active Goals</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-500">
              {totalSolLocked.toFixed(2)}
            </p>
            <p className="text-xs text-muted-foreground">SOL Locked</p>
          </div>
        </div>

        {/* Active Goal Status */}
        {connected && (
          <div className="text-center p-3 bg-muted/30 rounded-lg">
            <p className="text-sm font-semibold">
              {hasActiveGoal ? '🎯 Active Goal' : '✅ Ready for New Goal'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {hasActiveGoal 
                ? 'Complete current goal to create new one' 
                : 'You can create a new goal now'
              }
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3 pt-4 border-t border-border">
          <Button
            onClick={onCreateGoal}
            className="w-full gradient-primary shadow-glow"
            disabled={!connected || hasActiveGoal}
          >
            {hasActiveGoal ? 'Complete Current Goal First' : '+ Create Goal'}
          </Button>
          <Button
            variant="outline"
            onClick={onViewHistory}
            className="w-full"
            disabled={!connected}
          >
            View History
          </Button>
        </div>
      </div>
    </Card>
  );
};