"use client";
import { FeedItem } from '@/types/goal';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SocialFeedProps {
  items: FeedItem[];
}

export const SocialFeed = ({ items }: SocialFeedProps) => {
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const getTypeStyles = (type: FeedItem['type']) => {
    switch (type) {
      case 'goal_completed':
        return 'border-l-success bg-success/5';
      case 'goal_failed':
        return 'border-l-destructive bg-destructive/5';
      case 'goal_created':
        return 'border-l-accent bg-accent/5';
      case 'verification_requested':
        return 'border-l-primary bg-primary/5';
      default:
        return 'border-l-muted';
    }
  };

  return (
    <Card className="p-6 shadow-card border-border">
      <div className="mb-4">
        <h3 className="text-xl font-semibold">Community Feed</h3>
        <p className="text-sm text-muted-foreground">Recent activity from the community</p>
      </div>
      
      <ScrollArea className="h-[300px] pr-4">
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className={`border-l-4 pl-4 py-3 rounded-r-lg transition-smooth hover:bg-muted/30 ${getTypeStyles(item.type)}`}
            >
              <div className="flex items-start gap-3">
                <div className="text-2xl">{item.avatar}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">{item.username}</span>
                    <span className="text-xs text-muted-foreground">{formatTimestamp(item.timestamp)}</span>
                  </div>
                  <p className="text-sm text-foreground/90 mt-1">{item.message}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
};
