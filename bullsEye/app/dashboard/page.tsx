"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { ProfileCard } from "@/components/ProfileCard";
import { GoalCard } from "@/components/GoalCard";
import { SocialFeed } from "@/components/SocialFeed";
import { CreateGoalModal } from "@/components/CreateGoalModal";
import { VerificationModal } from "@/components/VerificationModal";
// import { DemoControls } from "@/components/DemoControls";
import { Goal, FeedItem } from "@/types/goal";
import { mockApi } from "@/lib/mockApi";

export default function DashboardPage() {
  const { publicKey, connected } = useWallet();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [verificationModalOpen, setVerificationModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [activeGoal, setActiveGoal] = useState<Goal | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasActiveGoal, setHasActiveGoal] = useState(false);

  const loadData = async () => {
    try {
      setIsLoading(true);
      console.log('📊 Loading dashboard data...', { publicKey: publicKey?.toString() });
      
      // Fetch feed first (always works)
      const feedData = await mockApi.getFeed();
      setFeed(feedData);
      
      // Only fetch goals if wallet is connected
      if (publicKey) {
        try {
          const goalsData = await mockApi.getGoals(publicKey.toString());
          console.log('✅ Goals loaded:', goalsData);
          setGoals(goalsData);
          
          // Set active goal (first non-claimed goal)
          const active = goalsData.find(g => g.status !== 'claimed' && g.status !== 'failed') || null;
          setActiveGoal(active);
          
          // Check if user has active goal
          const hasActive = await mockApi.hasActiveGoal(publicKey.toString());
          setHasActiveGoal(hasActive);
        } catch (error: any) {
          console.log('ℹ️ No goals found for this wallet (this is normal for new users)');
          setGoals([]);
          setActiveGoal(null);
          setHasActiveGoal(false);
        }
      } else {
        setGoals([]);
        setActiveGoal(null);
        setHasActiveGoal(false);
      }
    } catch (error) {
      console.error('❌ Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [publicKey, connected]);

  const handleCreateGoal = () => {
    if (!connected) {
      console.log('⚠️ Wallet not connected');
      return;
    }
    
    if (hasActiveGoal) {
      console.log('⚠️ User already has active goal');
      return;
    }
    
    setCreateModalOpen(true);
  };

  // This function just opens the modal - GoalCard already submitted the goal
  const handleVerificationRequest = (goal: Goal) => {
    console.log('📨 Opening verification modal for goal:', goal.id);
    setSelectedGoal(goal);
    setVerificationModalOpen(true);
  };

  const totalSolLocked = goals
    .filter(g => g.status !== 'claimed' && g.status !== 'failed')
    .reduce((sum, g) => sum + g.amountSol, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Modern Header */}
        <header className="mb-12">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-lg shadow-purple-500/25">
              <span className="text-2xl">🎯</span>
            </div>
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                Accountability as a Service
              </h1>
              <p className="text-gray-400 text-lg mt-1">
                Lock SOL, achieve goals, earn rewards
              </p>
            </div>
          </div>
          
          {/* Status Messages */}
          <div className="flex flex-wrap gap-3 mt-6">
            {!connected && (
              <div className="px-4 py-2 rounded-xl bg-yellow-500/10 border border-yellow-500/20 backdrop-blur-sm">
                <p className="text-sm text-yellow-400 flex items-center gap-2">
                  <span>⚠️</span>
                  <span>Connect your wallet to get started</span>
                </p>
              </div>
            )}
            {connected && hasActiveGoal && (
              <div className="px-4 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20 backdrop-blur-sm">
                <p className="text-sm text-blue-400 flex items-center gap-2">
                  <span>ℹ️</span>
                  <span>Complete your current goal to create a new one</span>
                </p>
              </div>
            )}
            {connected && !hasActiveGoal && (
              <div className="px-4 py-2 rounded-xl bg-green-500/10 border border-green-500/20 backdrop-blur-sm">
                <p className="text-sm text-green-400 flex items-center gap-2">
                  <span>✨</span>
                  <span>Ready to create your next goal</span>
                </p>
              </div>
            )}
          </div>
        </header>

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* Left Sidebar - Profile */}
          <div className="lg:col-span-3 space-y-6">
            <div className="sticky top-6">
              <ProfileCard
                totalGoals={goals.length}
                totalSolLocked={totalSolLocked}
                onCreateGoal={handleCreateGoal}
                onViewHistory={() => console.log('View history')}
              />
              
              {/* DemoControls - Commented out for production */}
              {/* {connected && (
                <DemoControls
                  activeGoalId={activeGoal?.user || null}
                  onVoteSuccess={loadData}
                />
              )} */}
            </div>
          </div>

          {/* Right Column - Active Goal & Feed */}
          <div className="lg:col-span-9 space-y-6 lg:space-y-8">
            {/* Active Goal Section */}
            <div className="backdrop-blur-xl bg-white/5 rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
              <div className="p-6 border-b border-white/10 bg-gradient-to-r from-purple-500/10 to-blue-500/10">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                    🚀
                  </span>
                  Active Goal
                </h2>
              </div>
              
              <div className="p-6">
                {isLoading ? (
                  <div className="text-center py-12">
                    <div className="inline-block w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mb-4"></div>
                    <p className="text-gray-400">Loading your goals...</p>
                  </div>
                ) : (
                  <GoalCard
                    goal={activeGoal}
                    onVerificationRequest={handleVerificationRequest}
                    onRefresh={loadData}
                  />
                )}
              </div>
            </div>

            {/* Social Feed Section */}
            <div className="backdrop-blur-xl bg-white/5 rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
              <div className="p-6 border-b border-white/10 bg-gradient-to-r from-blue-500/10 to-purple-500/10">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                    🌟
                  </span>
                  Community Feed
                </h2>
              </div>
              
              <div className="p-6">
                <SocialFeed items={feed} />
              </div>
            </div>
          </div>
        </div>

        {/* Modals */}
        <CreateGoalModal
          open={createModalOpen}
          onOpenChange={setCreateModalOpen}
          onSuccess={loadData}
        />

        <VerificationModal
          open={verificationModalOpen}
          onOpenChange={setVerificationModalOpen}
          goal={selectedGoal}
        />
      </div>
    </div>
  );
}