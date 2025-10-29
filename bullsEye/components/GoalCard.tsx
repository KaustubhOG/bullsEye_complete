"use client";
import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Goal } from '@/types/goal';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react';
import { mockApi } from '@/lib/mockApi';
import { useToast } from '@/hooks/use-toast';

interface GoalCardProps {
  goal: Goal | null;
  onVerificationRequest: (goal: Goal) => void;
  onRefresh: () => void;
}

export const GoalCard = ({ goal, onVerificationRequest, onRefresh }: GoalCardProps) => {
  // Get wallet adapter methods (not the wrapper)
  const { publicKey, signTransaction, signAllTransactions } = useWallet();
  const { toast } = useToast();
  const [claiming, setClaiming] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!goal) {
    return (
      <Card className="p-12 shadow-card border-border flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="text-6xl mb-4">🎯</div>
          <h3 className="text-xl font-semibold mb-2">No Active Goal</h3>
          <p className="text-muted-foreground">Create a goal to get started!</p>
          <p className="text-xs text-muted-foreground mt-2">
            Complete your current goal to create a new one
          </p>
        </div>
      </Card>
    );
  }

  const deadline = new Date(goal.deadline);
  const now = new Date();
  const timeLeft = deadline.getTime() - now.getTime();
  const daysLeft = Math.ceil(timeLeft / (1000 * 60 * 60 * 24));
  const totalDays = Math.ceil((deadline.getTime() - new Date(goal.createdAt).getTime()) / (1000 * 60 * 60 * 24));
  const progress = Math.max(0, Math.min(100, ((totalDays - daysLeft) / totalDays) * 100));

  const isVerified = goal.status === 'verified' || (goal.yesVotes >= 2 && goal.finalized);
  const canClaim = isVerified && goal.status !== 'claimed' && goal.status !== 'failed';
  const canSubmit = goal.status === 'active';

  const handleSubmitForVerification = async () => {
    if (!publicKey || !signTransaction || !signAllTransactions) {
      toast({
        title: 'Wallet not connected',
        description: 'Please connect your wallet',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSubmitting(true);
      console.log('📤 Submitting for verification...', goal.user);
      
      // Create proper wallet adapter object
      const walletAdapter = {
        publicKey,
        signTransaction,
        signAllTransactions,
      };
      
      await mockApi.requestVerification(goal.id, goal.user, walletAdapter);
      
      toast({
        title: 'Submitted for verification! ✨',
        description: 'Verifiers can now vote on your goal',
      });
      
      // Refresh to get updated goal data
      await onRefresh();
      
      // Open verification modal with Blink links
      onVerificationRequest(goal);
    } catch (error: any) {
      console.error('❌ Submit failed:', error);
      toast({
        title: 'Submission failed',
        description: error.message || 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleClaim = async () => {
    if (!publicKey || !signTransaction || !signAllTransactions) {
      toast({
        title: 'Wallet not connected',
        description: 'Please connect your wallet',
        variant: 'destructive',
      });
      return;
    }

    try {
      setClaiming(true);
      console.log('💰 Claiming funds...', goal.user);
      
      // Create proper wallet adapter object
      const walletAdapter = {
        publicKey,
        signTransaction,
        signAllTransactions,
      };
      
      const result = await mockApi.claimFunds(goal.id, goal.user, walletAdapter);
      
      toast({
        title: result.success ? 'Success! 🎉' : 'Goal Failed 😢',
        description: result.success 
          ? `Claimed ${goal.amountSol} SOL successfully!`
          : `Funds sent to ${goal.failAction === 'burn' ? 'burn wallet' : 'company wallet'}`,
      });
      
      onRefresh();
    } catch (error: any) {
      console.error('❌ Claim failed:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to claim funds',
        variant: 'destructive',
      });
    } finally {
      setClaiming(false);
    }
  };

  const statusColor = {
    pending: 'bg-yellow-500/20 text-yellow-500',
    active: 'bg-blue-500/20 text-blue-500',
    submitted: 'bg-purple-500/20 text-purple-500',
    verified: 'bg-green-500/20 text-green-500',
    claimed: 'bg-primary/20 text-primary',
    failed: 'bg-red-500/20 text-red-500',
  }[goal.status] || 'bg-muted';

  return (
    <Card className="p-8 shadow-card border-border">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge className={statusColor}>
                {goal.status.toUpperCase()}
              </Badge>
              <Badge variant="outline">
                {goal.amountSol} SOL Locked
              </Badge>
            </div>
            <h2 className="text-3xl font-bold mb-2">{goal.title}</h2>
            <p className="text-muted-foreground">{goal.description}</p>
          </div>
        </div>

        {/* Deadline & Progress */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-accent" />
              <span className="text-muted-foreground">Time Remaining</span>
            </div>
            <span className="font-semibold">
              {daysLeft > 0 ? `${daysLeft} days` : 'Expired'}
            </span>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="text-xs text-muted-foreground text-right">
            Deadline: {deadline.toLocaleDateString()}
          </div>
        </div>

        {/* Verification Progress */}
        {(goal.status === 'submitted' || goal.yesVotes > 0) && (
          <div className="bg-accent/10 border border-accent/20 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold">Verification Progress</span>
              <span className="text-sm font-bold text-accent">
                {goal.yesVotes} / 2 YES votes
              </span>
            </div>
            <Progress value={(goal.yesVotes / 2) * 100} className="h-2" />
            
            <div className="mt-3 text-xs text-muted-foreground">
              <p>✅ YES votes: {goal.yesVotes}</p>
              <p>❌ NO votes: {goal.noVotes}</p>
              {goal.finalized && (
                <p className="font-semibold text-accent mt-2">
                  {isVerified ? '✅ Verification complete!' : '❌ Verification failed'}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          {canSubmit && (
            <Button
              onClick={handleSubmitForVerification}
              disabled={submitting}
              className="flex-1 gradient-primary shadow-glow"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              {submitting ? 'Submitting...' : 'Submit for Verification'}
            </Button>
          )}
          
          {canClaim && (
            <Button
              onClick={handleClaim}
              disabled={claiming}
              className="flex-1 bg-success hover:bg-success/90"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              {claiming ? 'Processing...' : 'Claim Funds'}
            </Button>
          )}

          {goal.status === 'claimed' && (
            <div className="flex-1 bg-success/10 border border-success/20 rounded-lg p-4 text-center">
              <CheckCircle2 className="w-6 h-6 text-success mx-auto mb-2" />
              <p className="text-sm font-semibold text-success">Claimed Successfully!</p>
              <p className="text-xs text-muted-foreground mt-1">
                You can now create a new goal
              </p>
            </div>
          )}

          {goal.status === 'failed' && (
            <div className="flex-1 bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-center">
              <AlertCircle className="w-6 h-6 text-destructive mx-auto mb-2" />
              <p className="text-sm font-semibold text-destructive">Goal Failed</p>
              <p className="text-xs text-muted-foreground mt-1">
                You can now create a new goal
              </p>
            </div>
          )}
        </div>

        {/* Fail Destination Info */}
        <div className="text-xs text-muted-foreground text-center pt-2 border-t border-border">
          If failed, funds will be sent to: <span className="font-semibold">{goal.failAction === 'burn' ? '🔥 Burn Wallet' : '🏢 Company Wallet'}</span>
        </div>
      </div>
    </Card>
  );
};