import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface Room {
  id: string;
  name: string;
  unlocked: boolean;
  requiredStreak: number;
  position: { x: number; y: number };
  color: string;
}

interface AvatarWorldProps {
  currentStreak: number;
  unlockedRooms: string[];
  avatarUrl: string;
}

const rooms: Room[] = [
  { id: 'bedroom', name: 'Bedroom', unlocked: true, requiredStreak: 0, position: { x: 50, y: 50 }, color: 'bg-pastel-blue' },
  { id: 'playroom', name: 'Playroom', unlocked: false, requiredStreak: 3, position: { x: 150, y: 30 }, color: 'bg-mint-green' },
  { id: 'treehouse', name: 'Treehouse', unlocked: false, requiredStreak: 7, position: { x: 250, y: 70 }, color: 'bg-sunshine-yellow' },
  { id: 'garden', name: 'Garden', unlocked: false, requiredStreak: 14, position: { x: 350, y: 40 }, color: 'bg-lavender-accent' },
  { id: 'castle', name: 'Castle', unlocked: false, requiredStreak: 30, position: { x: 450, y: 60 }, color: 'bg-coral-accent' },
];

export function AvatarWorld({ currentStreak, unlockedRooms, avatarUrl }: AvatarWorldProps) {
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  const isRoomUnlocked = (room: Room) => {
    return room.unlocked || currentStreak >= room.requiredStreak || unlockedRooms.includes(room.id);
  };

  return (
    <div className="bg-white rounded-2xl p-4 shadow-card">
      <h3 className="font-semibold text-dark-slate mb-4">Your Avatar World</h3>
      
      <div className="relative h-40 bg-gradient-to-b from-blue-100 to-green-100 rounded-lg overflow-hidden">
        {/* Avatar */}
        <motion.div
          className="absolute bottom-2 left-2 w-12 h-12"
          animate={{
            x: selectedRoom ? selectedRoom.position.x - 24 : 0,
            y: selectedRoom ? -selectedRoom.position.y : 0,
          }}
          transition={{ type: 'spring', stiffness: 100 }}
        >
          <img
            src={avatarUrl}
            alt="Avatar"
            className="w-full h-full rounded-full border-2 border-white shadow-sm"
          />
        </motion.div>

        {/* Rooms */}
        {rooms.map((room) => {
          const unlocked = isRoomUnlocked(room);
          
          return (
            <motion.div
              key={room.id}
              className={cn(
                'absolute w-12 h-12 rounded-lg flex items-center justify-center cursor-pointer',
                unlocked ? room.color : 'bg-medium-gray',
                'shadow-sm'
              )}
              style={{
                left: `${room.position.x}px`,
                bottom: `${room.position.y}px`,
              }}
              whileHover={unlocked ? { scale: 1.1 } : {}}
              whileTap={unlocked ? { scale: 0.95 } : {}}
              onClick={() => unlocked && setSelectedRoom(room)}
            >
              {!unlocked && <Lock className="h-5 w-5 text-white" />}
            </motion.div>
          );
        })}
      </div>

      {/* Room info */}
      <div className="mt-4 text-center">
        {selectedRoom ? (
          <div>
            <p className="font-medium text-dark-slate">{selectedRoom.name}</p>
            <p className="text-sm text-medium-gray">
              {isRoomUnlocked(selectedRoom) ? 'Unlocked!' : `Unlock at ${selectedRoom.requiredStreak} day streak`}
            </p>
          </div>
        ) : (
          <p className="text-sm text-medium-gray">Tap a room to explore!</p>
        )}
      </div>
    </div>
  );
}