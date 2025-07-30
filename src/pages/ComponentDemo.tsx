import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import { Skeleton } from '@/components/ui/Skeleton';
import { Badge } from '@/components/ui/Badge';
import { Search, Mail, Plus } from 'lucide-react';

export function ComponentDemo() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');

  return (
    <div className="min-h-screen bg-light-gray p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-dark-slate">Chore Quest Design System</h1>

        {/* Buttons */}
        <Card>
          <h2 className="text-xl font-semibold mb-4">Buttons</h2>
          <div className="flex flex-wrap gap-4">
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="success">Success</Button>
            <Button variant="danger">Danger</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="outline">Outline</Button>
            <Button isLoading>Loading</Button>
            <Button leftIcon={<Plus className="h-4 w-4" />}>With Icon</Button>
          </div>
          <div className="flex flex-wrap gap-4 mt-4">
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
            <Button size="xl">Extra Large</Button>
          </div>
        </Card>

        {/* Inputs */}
        <Card>
          <h2 className="text-xl font-semibold mb-4">Inputs</h2>
          <div className="space-y-4 max-w-md">
            <Input
              label="Email"
              placeholder="Enter your email"
              leftIcon={<Mail className="h-4 w-4" />}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            <Input
              label="Search"
              placeholder="Search tasks..."
              rightIcon={<Search className="h-4 w-4" />}
              helperText="Search by task name or assignee"
            />
            <Input
              label="With Error"
              placeholder="Enter value"
              error="This field is required"
            />
          </div>
        </Card>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <h3 className="font-semibold mb-2">Default Card</h3>
            <p className="text-medium-gray">This is a default card with shadow.</p>
          </Card>
          <Card variant="interactive">
            <h3 className="font-semibold mb-2">Interactive Card</h3>
            <p className="text-medium-gray">Hover me for effect!</p>
          </Card>
          <Card variant="bordered">
            <h3 className="font-semibold mb-2">Bordered Card</h3>
            <p className="text-medium-gray">This card has a border.</p>
          </Card>
        </div>

        {/* Badges */}
        <Card>
          <h2 className="text-xl font-semibold mb-4">Badges</h2>
          <div className="flex flex-wrap gap-4">
            <Badge>Default</Badge>
            <Badge variant="primary">Primary</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="danger">Danger</Badge>
            <Badge size="sm" variant="primary">Small</Badge>
          </div>
        </Card>

        {/* Loading States */}
        <Card>
          <h2 className="text-xl font-semibold mb-4">Loading States</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Spinner size="sm" />
              <Spinner size="md" />
              <Spinner size="lg" />
              <Spinner size="xl" />
              <Spinner color="secondary" />
            </div>
            <div className="space-y-2 max-w-md">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton variant="rectangular" className="h-32 w-full" />
            </div>
          </div>
        </Card>

        {/* Modal Demo */}
        <Card>
          <h2 className="text-xl font-semibold mb-4">Modal</h2>
          <Button onClick={() => setIsModalOpen(true)}>Open Modal</Button>
        </Card>

        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Example Modal"
        >
          <p className="text-medium-gray mb-4">
            This is an example modal with animation. It can contain any content!
          </p>
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setIsModalOpen(false)}>Save Changes</Button>
          </div>
        </Modal>
      </div>
    </div>
  );
}