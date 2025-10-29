"use client";
import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ThumbsUp, ThumbsDown, Coins, Info } from 'lucide-react';
import { mockApi } from '@/lib/mockApi';
import { useToast } from '@/hooks/use-toast';
import { VERIFIERS } from '@/lib/solana/config';

interface DemoControlsProps {
  activeGoalId: string | null;
  onVoteSuccess: () => void;
}

export const DemoControls = ({ activeGoalId, onVoteSuccess }: DemoControlsProps) => {
  const { publicKey, signTransaction, signAllTransactions } = useWallet();
  const { toast } = useToast();
  
  // State for voting
  const [goalOwnerWallet, setGoalOwnerWallet] = useState('');
  const [verifierIndex, setVerifierIndex] = useState(0);
  const [voteType, setVoteType] = useState<'yes' | 'no'>('yes');
  const [voting, setVoting] = useState(false);
  const [airdropping, setAirdropping] = useState(false);

  const handleAirdrop = async () => {
    if (!publicKey) {
      toast({
        title: 'Wallet not connected',
        description: 'Please connect your wallet first',
        variant: 'destructive',
      });
      return;
    }

    try {
      setAirdropping(true);
      console.log('💰 Requesting airdrop...');
      
      const signature = await mockApi.requestAirdrop(publicKey.toString(), 2);
      
      toast({
        title: 'Airdrop successful! 💰',
        description: 'Received 2 SOL for testing',
      });
      
      console.log('✅ Airdrop signature:', signature);
    } catch (error: any) {
      console.error('❌ Airdrop failed:', error);
      toast({
        title: 'Airdrop failed',
        description: error.message || 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setAirdropping(false);
    }
  };

  const handleVote = async () => {
    // Use provided goal owner wallet or fall back to activeGoalId
    const targetWallet = goalOwnerWallet.trim() || (activeGoalId ? activeGoalId : '');
    
    if (!targetWallet) {
      toast({
        title: 'No goal specified',
        description: 'Enter the wallet address of the goal creator',
        variant: 'destructive',
      });
      return;
    }

    if (!publicKey || !signTransaction || !signAllTransactions) {
      toast({
        title: 'Wallet not connected',
        description: 'Please connect your wallet',
        variant: 'destructive',
      });
      return;
    }

    // Check if connected wallet is a verifier
    const isConnectedVerifier = VERIFIERS.some(v => v.equals(publicKey));
    if (!isConnectedVerifier) {
      toast({
        title: 'Not a verifier',
        description: `Connected wallet (${publicKey.toBase58().slice(0, 8)}...) is not a registered verifier`,
        variant: 'destructive',
      });
      return;
    }

    try {
      setVoting(true);
      console.log('🗳️ Casting vote...', { 
        goalOwner: targetWallet, 
        connectedWallet: publicKey.toBase58(),
        voteType 
      });
      
      // The verifier address comes from the CONNECTED wallet, not the dropdown
      const verifierAddress = publicKey.toBase58();
      
      // Create proper wallet adapter object
      const walletAdapter = {
        publicKey,
        signTransaction,
        signAllTransactions,
      };
      
      const result = await mockApi.vote(
        'dummy-goal-id', // Not used in current implementation
        verifierAddress,
        voteType,
        targetWallet, // Goal owner's wallet
        walletAdapter
      );
      
      toast({
        title: `Vote ${voteType === 'yes' ? 'Approved' : 'Rejected'}! ✅`,
        description: result.verified 
          ? 'Goal is now verified! Goal owner can claim funds.'
          : `Vote recorded. Current: ${result.votes.filter(v => v.vote === 'yes').length} YES, ${result.votes.filter(v => v.vote === 'no').length} NO votes.`,
      });
      
      onVoteSuccess();
      
      // Clear input after successful vote
      setGoalOwnerWallet('');
    } catch (error: any) {
      console.error('❌ Vote failed:', error);
      toast({
        title: 'Vote failed',
        description: error.message || 'Failed to cast vote',
        variant: 'destructive',
      });
    } finally {
      setVoting(false);
    }
  };

  // Check if connected wallet is a verifier
  const connectedIsVerifier = publicKey && VERIFIERS.some(v => v.equals(publicKey));

  return (
    <Card className="p-4 bg-muted/30 border-dashed">
      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-semibold mb-1 flex items-center gap-2">
            🎭 Demo Controls
            <span className="text-xs font-normal text-muted-foreground">(Testing Tools)</span>
          </h4>
          <p className="text-xs text-muted-foreground">
            Tools for testing on devnet
          </p>
        </div>

        {/* Airdrop Button */}
        <div className="space-y-2">
          <Label className="text-xs font-semibold">💰 Get Test SOL</Label>
          <Button
            onClick={handleAirdrop}
            disabled={!publicKey || airdropping}
            size="sm"
            className="w-full"
            variant="outline"
          >
            <Coins className="w-3 h-3 mr-2" />
            {airdropping ? 'Airdropping...' : 'Airdrop 2 SOL'}
          </Button>
          <p className="text-xs text-muted-foreground">
            Get free SOL for testing (devnet only)
          </p>
        </div>

        <div className="border-t border-border pt-3 space-y-3">
          <Label className="text-xs font-semibold">🗳️ Cast Vote as Verifier</Label>
          
          {/* Connected Wallet Info */}
          {publicKey && (
            <div className={`rounded p-2 text-xs ${connectedIsVerifier ? 'bg-green-500/10 border border-green-500/20 text-green-600' : 'bg-yellow-500/10 border border-yellow-500/20 text-yellow-600'}`}>
              <p className="font-semibold flex items-center gap-1">
                <Info className="w-3 h-3" />
                {connectedIsVerifier ? '✅ You are a verifier' : '⚠️ Not a verifier wallet'}
              </p>
              <p className="text-[10px] mt-0.5 font-mono">
                {publicKey.toBase58().slice(0, 12)}...{publicKey.toBase58().slice(-8)}
              </p>
            </div>
          )}
          
          {/* Goal Owner Wallet Input */}
          <div className="space-y-2">
            <Label htmlFor="goal-owner" className="text-xs">
              Goal Owner Wallet Address
            </Label>
            <Input
              id="goal-owner"
              name="goal-owner"
              placeholder="Enter wallet address that created the goal"
              value={goalOwnerWallet}
              onChange={(e) => setGoalOwnerWallet(e.target.value)}
              className="text-xs font-mono"
            />
            <p className="text-[10px] text-muted-foreground">
              {activeGoalId 
                ? `Or leave empty to vote on your own goal (${activeGoalId.slice(0, 8)}...)`
                : 'Paste the wallet address of the goal creator'}
            </p>
          </div>

          {/* Vote Type */}
          <div className="space-y-2">
            <Label className="text-xs">Vote Type</Label>
            <RadioGroup
              value={voteType}
              onValueChange={(value) => setVoteType(value as 'yes' | 'no')}
              className="flex gap-2"
            >
              <div className="flex items-center space-x-1 flex-1">
                <RadioGroupItem value="yes" id="vote-yes" />
                <Label htmlFor="vote-yes" className="text-xs cursor-pointer flex items-center gap-1">
                  <ThumbsUp className="w-3 h-3 text-green-500" /> Approve
                </Label>
              </div>
              <div className="flex items-center space-x-1 flex-1">
                <RadioGroupItem value="no" id="vote-no" />
                <Label htmlFor="vote-no" className="text-xs cursor-pointer flex items-center gap-1">
                  <ThumbsDown className="w-3 h-3 text-red-500" /> Reject
                </Label>
              </div>
            </RadioGroup>
          </div>

          <Button
            onClick={handleVote}
            disabled={voting || !publicKey || !connectedIsVerifier}
            size="sm"
            className="w-full"
            variant="secondary"
          >
            {voting ? 'Voting...' : 'Cast Vote'}
          </Button>
        </div>

        {/* Verifier List */}
        <div className="bg-accent/10 rounded p-2 text-xs">
          <p className="font-semibold text-accent mb-1">📋 Registered Verifiers:</p>
          <div className="space-y-0.5 text-[10px] font-mono text-muted-foreground">
            {VERIFIERS.map((v, i) => (
              <p key={i}>
                {i + 1}. {v.toBase58().slice(0, 8)}...{v.toBase58().slice(-4)}
              </p>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-500/10 rounded p-2 text-xs text-muted-foreground">
          <p className="font-semibold text-blue-400 mb-1">ℹ️ How to vote:</p>
          <ol className="space-y-0.5 text-[10px] ml-3">
            <li>1. Create a goal with Wallet A</li>
            <li>2. Submit goal for verification</li>
            <li>3. Copy Wallet A's address</li>
            <li>4. Switch to Verifier Wallet 1</li>
            <li>5. Paste Wallet A's address here</li>
            <li>6. Cast YES vote</li>
            <li>7. Switch to Verifier Wallet 2</li>
            <li>8. Paste Wallet A's address again</li>
            <li>9. Cast YES vote → Verified! ✅</li>
            <li>10. Switch back to Wallet A and claim!</li>
          </ol>
        </div>
      </div>
    </Card>
  );
};