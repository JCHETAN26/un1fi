import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MobileHeader } from '@/components/MobileHeader';
import { BottomNav } from '@/components/BottomNav';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { 
  Target, Plus, Home, GraduationCap, Palmtree, Car, Heart, 
  Briefcase, PiggyBank, TrendingUp, Calendar, ChevronRight,
  Trash2, Edit3, Loader2, CheckCircle2, AlertTriangle
} from 'lucide-react';

interface Goal {
  id: string;
  name: string;
  icon: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  monthlyContribution: number;
  linkedAssets: string[];
  color: string;
  createdAt: string;
}

const goalIcons: Record<string, { icon: React.ElementType; color: string }> = {
  home: { icon: Home, color: 'bg-blue-500' },
  education: { icon: GraduationCap, color: 'bg-purple-500' },
  retirement: { icon: Palmtree, color: 'bg-green-500' },
  car: { icon: Car, color: 'bg-orange-500' },
  health: { icon: Heart, color: 'bg-red-500' },
  business: { icon: Briefcase, color: 'bg-indigo-500' },
  savings: { icon: PiggyBank, color: 'bg-amber-500' },
  investment: { icon: TrendingUp, color: 'bg-teal-500' },
};

const LOCAL_GOALS_KEY = 'un1fi_goals';

const Goals = () => {
  const navigate = useNavigate();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGoal, setNewGoal] = useState({
    name: '',
    icon: 'savings',
    targetAmount: '',
    currentAmount: '',
    deadline: '',
    monthlyContribution: '',
  });

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = () => {
    try {
      const saved = localStorage.getItem(LOCAL_GOALS_KEY);
      if (saved) {
        setGoals(JSON.parse(saved));
      } else {
        // Demo goals
        const demoGoals: Goal[] = [
          {
            id: '1',
            name: 'House Down Payment',
            icon: 'home',
            targetAmount: 60000,
            currentAmount: 45000,
            deadline: '2027-06-01',
            monthlyContribution: 1500,
            linkedAssets: [],
            color: 'bg-blue-500',
            createdAt: new Date().toISOString(),
          },
          {
            id: '2',
            name: "Kid's University",
            icon: 'education',
            targetAmount: 50000,
            currentAmount: 12000,
            deadline: '2032-09-01',
            monthlyContribution: 500,
            linkedAssets: [],
            color: 'bg-purple-500',
            createdAt: new Date().toISOString(),
          },
          {
            id: '3',
            name: 'Early Retirement',
            icon: 'retirement',
            targetAmount: 500000,
            currentAmount: 180000,
            deadline: '2040-01-01',
            monthlyContribution: 2000,
            linkedAssets: [],
            color: 'bg-green-500',
            createdAt: new Date().toISOString(),
          },
        ];
        setGoals(demoGoals);
        localStorage.setItem(LOCAL_GOALS_KEY, JSON.stringify(demoGoals));
      }
    } catch (e) {
      console.error('Failed to load goals:', e);
    } finally {
      setLoading(false);
    }
  };

  const saveGoals = (updatedGoals: Goal[]) => {
    setGoals(updatedGoals);
    localStorage.setItem(LOCAL_GOALS_KEY, JSON.stringify(updatedGoals));
  };

  const createGoal = () => {
    if (!newGoal.name || !newGoal.targetAmount || !newGoal.deadline) {
      toast.error('Please fill in all required fields');
      return;
    }

    const goal: Goal = {
      id: Date.now().toString(),
      name: newGoal.name,
      icon: newGoal.icon,
      targetAmount: parseFloat(newGoal.targetAmount),
      currentAmount: parseFloat(newGoal.currentAmount) || 0,
      deadline: newGoal.deadline,
      monthlyContribution: parseFloat(newGoal.monthlyContribution) || 0,
      linkedAssets: [],
      color: goalIcons[newGoal.icon]?.color || 'bg-gray-500',
      createdAt: new Date().toISOString(),
    };

    saveGoals([...goals, goal]);
    setShowCreateModal(false);
    setNewGoal({ name: '', icon: 'savings', targetAmount: '', currentAmount: '', deadline: '', monthlyContribution: '' });
    toast.success('Goal created!');
  };

  const deleteGoal = (id: string) => {
    saveGoals(goals.filter(g => g.id !== id));
    toast.success('Goal deleted');
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);

  const calculateProgress = (goal: Goal) => {
    const progress = (goal.currentAmount / goal.targetAmount) * 100;
    return Math.min(progress, 100);
  };

  const calculateTimeRemaining = (deadline: string) => {
    const months = Math.ceil((new Date(deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24 * 30));
    if (months < 0) return 'Past deadline';
    if (months === 0) return 'This month';
    if (months < 12) return `${months} months`;
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    return remainingMonths > 0 ? `${years}y ${remainingMonths}m` : `${years} years`;
  };

  const calculateOnTrack = (goal: Goal) => {
    const monthsRemaining = Math.ceil((new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24 * 30));
    if (monthsRemaining <= 0) return goal.currentAmount >= goal.targetAmount;
    const requiredMonthly = (goal.targetAmount - goal.currentAmount) / monthsRemaining;
    return goal.monthlyContribution >= requiredMonthly;
  };

  const totalProgress = goals.reduce((sum, g) => sum + g.currentAmount, 0);
  const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <MobileHeader />
      <main className="px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Goals</h1>
            <p className="text-muted-foreground text-sm">Track your financial dreams</p>
          </div>
          <Button size="sm" onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4 mr-1" />New Goal
          </Button>
        </div>

        {/* Overall Progress */}
        <div className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-5 text-primary-foreground">
          <div className="flex items-center gap-3 mb-3">
            <Target className="h-6 w-6" />
            <span className="font-medium">Overall Progress</span>
          </div>
          <div className="flex items-end justify-between mb-3">
            <div>
              <p className="text-3xl font-bold">{formatCurrency(totalProgress)}</p>
              <p className="text-primary-foreground/70 text-sm">of {formatCurrency(totalTarget)} total</p>
            </div>
            <p className="text-2xl font-bold">{totalTarget > 0 ? Math.round((totalProgress / totalTarget) * 100) : 0}%</p>
          </div>
          <div className="h-2 bg-white/20 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white rounded-full transition-all duration-500"
              style={{ width: `${totalTarget > 0 ? (totalProgress / totalTarget) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* Goals List */}
        <div className="space-y-4">
          {goals.map((goal) => {
            const IconComponent = goalIcons[goal.icon]?.icon || Target;
            const progress = calculateProgress(goal);
            const isOnTrack = calculateOnTrack(goal);
            
            return (
              <div key={goal.id} className="bg-card rounded-xl p-4 border border-border">
                <div className="flex items-start gap-3">
                  <div className={`p-3 rounded-xl ${goal.color}`}>
                    <IconComponent className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold">{goal.name}</h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">{calculateTimeRemaining(goal.deadline)}</span>
                          {isOnTrack ? (
                            <span className="flex items-center gap-1 text-xs text-green-500">
                              <CheckCircle2 className="h-3 w-3" />On track
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-xs text-amber-500">
                              <AlertTriangle className="h-3 w-3" />Needs attention
                            </span>
                          )}
                        </div>
                      </div>
                      <button onClick={() => deleteGoal(goal.id)} className="p-1.5 text-muted-foreground hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="mt-3">
                      <div className="flex items-end justify-between mb-1.5">
                        <span className="text-lg font-bold">{formatCurrency(goal.currentAmount)}</span>
                        <span className="text-sm text-muted-foreground">{formatCurrency(goal.targetAmount)}</span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${goal.color}`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                        <span>{Math.round(progress)}% complete</span>
                        {goal.monthlyContribution > 0 && (
                          <span>+{formatCurrency(goal.monthlyContribution)}/mo</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {goals.length === 0 && (
            <div className="bg-card rounded-xl p-8 border border-border text-center">
              <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-2">No goals yet</h3>
              <p className="text-muted-foreground text-sm mb-4">Create your first financial goal to start tracking</p>
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="h-4 w-4 mr-2" />Create Goal
              </Button>
            </div>
          )}
        </div>
      </main>

      {/* Create Goal Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Goal</DialogTitle>
            <DialogDescription>Define your financial goal and track your progress</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Goal Type</Label>
              <div className="grid grid-cols-4 gap-2 mt-1.5">
                {Object.entries(goalIcons).map(([key, { icon: Icon, color }]) => (
                  <button
                    key={key}
                    onClick={() => setNewGoal({ ...newGoal, icon: key })}
                    className={`p-3 rounded-lg border-2 flex items-center justify-center transition-all ${
                      newGoal.icon === key ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <Icon className={`h-5 w-5 ${newGoal.icon === key ? 'text-primary' : 'text-muted-foreground'}`} />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label htmlFor="name">Goal Name *</Label>
              <Input id="name" placeholder="e.g., House Down Payment" value={newGoal.name} 
                onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })} className="mt-1.5" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="targetAmount">Target Amount *</Label>
                <Input id="targetAmount" type="number" placeholder="50000" value={newGoal.targetAmount}
                  onChange={(e) => setNewGoal({ ...newGoal, targetAmount: e.target.value })} className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="currentAmount">Current Amount</Label>
                <Input id="currentAmount" type="number" placeholder="0" value={newGoal.currentAmount}
                  onChange={(e) => setNewGoal({ ...newGoal, currentAmount: e.target.value })} className="mt-1.5" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="deadline">Target Date *</Label>
                <Input id="deadline" type="date" value={newGoal.deadline}
                  onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })} className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="monthlyContribution">Monthly Contribution</Label>
                <Input id="monthlyContribution" type="number" placeholder="500" value={newGoal.monthlyContribution}
                  onChange={(e) => setNewGoal({ ...newGoal, monthlyContribution: e.target.value })} className="mt-1.5" />
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setShowCreateModal(false)}>Cancel</Button>
            <Button className="flex-1" onClick={createGoal}>
              <Target className="h-4 w-4 mr-2" />Create Goal
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
};

export default Goals;