import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, CheckCircle, Circle } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface Quest {
  id: string;
  title: string;
  points: number;
  icon: string;
  completed: boolean;
  category: string;
}

interface DailyQuestsProps {
  quests: Quest[];
  onQuestClick?: (questId: string) => void;
}

export function DailyQuests({ quests, onQuestClick }: DailyQuestsProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  
  const completedCount = quests.filter(q => q.completed).length;
  const totalPoints = quests.reduce((sum, q) => sum + (q.completed ? q.points : 0), 0);

  return (
    <div className="bg-white rounded-2xl p-4 shadow-card">
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div>
          <h3 className="font-semibold text-dark-slate">Today's Quests</h3>
          <p className="text-sm text-medium-gray">
            {completedCount}/{quests.length} completed • {totalPoints} points earned
          </p>
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="h-5 w-5 text-medium-gray" />
        </motion.div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="mt-4 space-y-2">
              {quests.map((quest, index) => (
                <motion.div
                  key={quest.id}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => onQuestClick?.(quest.id)}
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors',
                    quest.completed ? 'bg-mint-green/10' : 'bg-light-gray hover:bg-gray-200'
                  )}
                >
                  <div className="text-2xl">{quest.icon}</div>
                  <div className="flex-1">
                    <p className={cn(
                      'font-medium',
                      quest.completed && 'line-through text-medium-gray'
                    )}>
                      {quest.title}
                    </p>
                    <p className="text-sm text-medium-gray">
                      {quest.points} points • {quest.category}
                    </p>
                  </div>
                  {quest.completed ? (
                    <CheckCircle className="h-5 w-5 text-mint-green" />
                  ) : (
                    <Circle className="h-5 w-5 text-medium-gray" />
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}