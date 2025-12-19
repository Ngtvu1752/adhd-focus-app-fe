import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Gift, Star, ShoppingBag, History, Sparkles, Lock, CheckCircle, Clock, XCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Progress } from './ui/progress';
import { toast } from 'sonner';

interface Reward {
  id: string;
  name: string;
  description: string;
  pointsCost: number;
  icon: string;
  active: boolean;
}

interface RewardRequest {
  id: string;
  rewardId: string;
  rewardName: string;
  pointsCost: number;
  requestedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedAt?: string;
}

interface UserProgress {
  totalPoints: number;
  level: number;
  currentLevelPoints: number;
  pointsToNextLevel: number;
  totalSessions: number;
  streak: number;
}

export function RewardsShop() {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [requests, setRequests] = useState<RewardRequest[]>([]);
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    // Load rewards
    const savedRewards = localStorage.getItem('rewards');
    if (savedRewards) {
      const allRewards = JSON.parse(savedRewards);
      setRewards(allRewards.filter((r: Reward) => r.active));
    } else {
      // Fake Data: Rewards
      const fakeRewards: Reward[] = [
        { id: '1', name: '30 phút xem màn hình', description: 'Xem TV hoặc chơi game', pointsCost: 50, icon: '📺', active: true },
        { id: '2', name: 'Một cây kem', description: 'Một viên kem vị yêu thích', pointsCost: 100, icon: '🍦', active: true },
        { id: '3', name: 'Truyện tranh mới', description: 'Chọn một cuốn ở cửa hàng', pointsCost: 300, icon: '📚', active: true },
        { id: '4', name: 'Tiệc Pizza', description: 'Chọn loại nhân con thích!', pointsCost: 500, icon: '🍕', active: true },
        { id: '5', name: 'Đi công viên', description: 'Đi chơi ở sân chơi lớn', pointsCost: 150, icon: '🌳', active: true },
        { id: '6', name: 'Thức khuya', description: 'Thêm 30 phút vào cuối tuần', pointsCost: 200, icon: '🌙', active: true },
      ];
      setRewards(fakeRewards);
      localStorage.setItem('rewards', JSON.stringify(fakeRewards));
    }

    // Load user progress
    const savedProgress = localStorage.getItem('userProgress');
    if (savedProgress) {
      setUserProgress(JSON.parse(savedProgress));
    } else {
      // Fake Data: User Progress
      const fakeProgress: UserProgress = {
        totalPoints: 450,
        level: 5,
        currentLevelPoints: 50,
        pointsToNextLevel: 100,
        totalSessions: 25,
        streak: 7
      };
      setUserProgress(fakeProgress);
      localStorage.setItem('userProgress', JSON.stringify(fakeProgress));
    }

    // Load requests
    const savedRequests = localStorage.getItem('rewardRequests');
    if (savedRequests) {
      setRequests(JSON.parse(savedRequests));
    } else {
      // Fake Data: Requests History
      const fakeRequests: RewardRequest[] = [
        {
          id: 'req-1',
          rewardId: '2',
          rewardName: 'Ice Cream Treat',
          pointsCost: 100,
          requestedAt: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
          status: 'approved',
          approvedAt: new Date(Date.now() - 86400000).toISOString() // 1 day ago
        },
        {
          id: 'req-2',
          rewardId: '1',
          rewardName: '30 Mins Screen Time',
          pointsCost: 50,
          requestedAt: new Date().toISOString(),
          status: 'pending'
        },
        {
          id: 'req-3',
          rewardId: '4',
          rewardName: 'Pizza Night',
          pointsCost: 500,
          requestedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
          status: 'rejected'
        }
      ];
      setRequests(fakeRequests);
      localStorage.setItem('rewardRequests', JSON.stringify(fakeRequests));
    }
  };


  const canAfford = (pointsCost: number) => {
    return userProgress && userProgress.totalPoints >= pointsCost;
  };

  const handleRedeemClick = (reward: Reward) => {
    if (!canAfford(reward.pointsCost)) {
      toast.error(`Con cần thêm ${reward.pointsCost - (userProgress?.totalPoints || 0)} điểm nữa! Cố lên! 💪`);
      return;
    }
    setSelectedReward(reward);
    setShowConfirmDialog(true);
  };

  const handleConfirmRedeem = () => {
    if (!selectedReward || !userProgress) return;

    // Deduct points
    const newProgress = {
      ...userProgress,
      totalPoints: userProgress.totalPoints - selectedReward.pointsCost
    };
    localStorage.setItem('userProgress', JSON.stringify(newProgress));
    setUserProgress(newProgress);

    // Create request
    const newRequest: RewardRequest = {
      id: Date.now().toString(),
      rewardId: selectedReward.id,
      rewardName: selectedReward.name,
      pointsCost: selectedReward.pointsCost,
      requestedAt: new Date().toISOString(),
      status: 'pending'
    };

    const updatedRequests = [...requests, newRequest];
    localStorage.setItem('rewardRequests', JSON.stringify(updatedRequests));
    setRequests(updatedRequests);

    setShowConfirmDialog(false);
    setShowCelebration(true);
    
    toast.success(`🎉 Đã gửi yêu cầu! Hãy nhờ ba mẹ duyệt nhé!`);

    setTimeout(() => {
      setShowCelebration(false);
      setSelectedReward(null);
    }, 3000);
  };

  const myRequests = requests.filter(r => r.status === 'pending');
  const approvedRewards = requests.filter(r => r.status === 'approved');
  const rejectedRewards = requests.filter(r => r.status === 'rejected');

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: '#F7F4EE' }}>
      <div className="max-w-6xl mx-auto">
        {/* Header with Points Display */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="mb-2" style={{ color: '#333333' }}>
                🎁 Cửa hàng đổi quà
              </h1>
              <p style={{ color: '#666666' }}>
                Dùng điểm tích lũy để đổi những món quà tuyệt vời!
              </p>
            </div>
            
            {/* Points Card */}
            <Card className="p-6 rounded-2xl border-0" style={{ backgroundColor: '#FFD966' }}>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: 'white' }}>
                  <Star className="w-8 h-8" style={{ color: '#FFD966' }} />
                </div>
                <div>
                  <p className="text-sm" style={{ color: '#333333' }}>
                    Your Points
                  </p>
                  <p className="text-3xl" style={{ color: '#333333' }}>
                    {userProgress?.totalPoints || 0}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </motion.div>

        <Tabs defaultValue="shop" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="shop">
              <ShoppingBag className="w-4 h-4 mr-2" />
              Cửa hàng
            </TabsTrigger>
            <TabsTrigger value="history">
              <History className="w-4 h-4 mr-2" />
              Quà của tôi
            </TabsTrigger>
          </TabsList>

          {/* Shop Tab */}
          <TabsContent value="shop">
            {rewards.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <Card className="p-12 rounded-2xl border-0 text-center" style={{ backgroundColor: 'white' }}>
                  <div className="mb-4 text-6xl">🎁</div>
                  <h2 className="mb-2" style={{ color: '#333333' }}>
                    Chưa có quà nào
                  </h2>
                  <p style={{ color: '#666666' }}>
                    Hãy nhờ ba mẹ thêm quà để con phấn đấu nhé!
                  </p>
                </Card>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {rewards.map((reward, index) => {
                  const affordable = canAfford(reward.pointsCost);
                  const alreadyRequested = myRequests.some(r => r.rewardId === reward.id);
                  
                  return (
                    <motion.div
                      key={reward.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <Card
                        className="p-6 rounded-2xl border-0 relative overflow-hidden"
                        style={{
                          backgroundColor: affordable ? 'white' : '#F7F4EE',
                          opacity: affordable ? 1 : 0.7
                        }}
                      >
                        {/* Sparkle effect for affordable items */}
                        {affordable && (
                          <motion.div
                            className="absolute top-2 right-2"
                            animate={{ rotate: [0, 360] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                          >
                            <Sparkles className="w-5 h-5" style={{ color: '#FFD966' }} />
                          </motion.div>
                        )}

                        {!affordable && (
                          <div className="absolute top-3 right-3">
                            <Lock className="w-5 h-5" style={{ color: '#999999' }} />
                          </div>
                        )}

                        <div className="text-6xl mb-4 text-center">
                          {reward.icon}
                        </div>

                        <h3 className="mb-2 text-center" style={{ color: '#333333' }}>
                          {reward.name}
                        </h3>

                        {reward.description && (
                          <p className="text-sm mb-4 text-center" style={{ color: '#666666' }}>
                            {reward.description}
                          </p>
                        )}

                        <div
                          className="flex items-center justify-center gap-2 px-4 py-2 rounded-full mb-4 mx-auto"
                          style={{
                            backgroundColor: affordable ? '#FFD966' : '#E8F5FF',
                            width: 'fit-content'
                          }}
                        >
                          <Star className="w-5 h-5" style={{ color: '#333333' }} />
                          <span style={{ color: '#333333' }}>
                            {reward.pointsCost}
                          </span>
                        </div>

                        {alreadyRequested ? (
                          <Button
                            disabled
                            className="w-full rounded-full"
                            style={{ backgroundColor: '#E8F5FF', color: '#666666' }}
                          >
                            <Clock className="w-4 h-4 mr-2" />
                            Chờ duyệt
                          </Button>
                        ) : (
                          <Button
                            className="w-full rounded-full"
                            disabled={!affordable}
                            style={affordable ? {
                              backgroundColor: '#DFF7E8',
                              color: '#333333'
                            } : {
                              backgroundColor: '#E8E8E8',
                              color: '#999999'
                            }}
                            onClick={() => handleRedeemClick(reward)}
                          >
                            {affordable ? (
                              <>
                                <Gift className="w-4 h-4 mr-2" />
                                Đổi quà này!
                              </>
                            ) : (
                              <>
                                <Lock className="w-4 h-4 mr-2" />
                                Cần thêm {reward.pointsCost - (userProgress?.totalPoints || 0)} điểm
                              </>
                            )}
                          </Button>
                        )}
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history">
            <div className="space-y-6">
              {/* Pending Requests */}
              {myRequests.length > 0 && (
                <div>
                  <h2 className="mb-4" style={{ color: '#333333' }}>
                    ⏳ Đang chờ duyệt
                  </h2>
                  <div className="space-y-3">
                    {myRequests.map((request, index) => (
                      <motion.div
                        key={request.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Card className="p-6 rounded-2xl border-0" style={{ backgroundColor: '#FFF9E6' }}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="text-4xl">⏰</div>
                              <div>
                                <h3 className="mb-1" style={{ color: '#333333' }}>
                                  {request.rewardName}
                                </h3>
                                <p className="text-sm" style={{ color: '#666666' }}>
                                  Yêu cầu ngày {new Date(request.requestedAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <Badge
                              className="rounded-full"
                              style={{ backgroundColor: '#FFD966', color: '#333333' }}
                            >
                              <Clock className="w-3 h-3 mr-1" />
                              Chờ duyệt
                            </Badge>
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Approved Rewards */}
              {approvedRewards.length > 0 && (
                <div>
                  <h2 className="mb-4" style={{ color: '#333333' }}>
                    ✅ Quà đã được duyệt
                  </h2>
                  <div className="space-y-3">
                    {approvedRewards.map((request, index) => (
                      <motion.div
                        key={request.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Card className="p-6 rounded-2xl border-0" style={{ backgroundColor: '#DFF7E8' }}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="text-4xl">🎉</div>
                              <div>
                                <h3 className="mb-1" style={{ color: '#333333' }}>
                                  {request.rewardName}
                                </h3>
                                <p className="text-sm" style={{ color: '#666666' }}>
                                  Duyệt ngày {request.approvedAt && new Date(request.approvedAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <Badge
                              className="rounded-full"
                              style={{ backgroundColor: '#333333', color: 'white' }}
                            >
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Đã duyệt
                            </Badge>
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Rejected Rewards */}
              {rejectedRewards.length > 0 && (
                <div>
                  <h2 className="mb-4" style={{ color: '#333333' }}>
                    ❌ Chưa được duyệt
                  </h2>
                  <div className="space-y-3">
                    {rejectedRewards.map((request, index) => (
                      <motion.div
                        key={request.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Card className="p-6 rounded-2xl border-0" style={{ backgroundColor: 'white' }}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="text-4xl">💔</div>
                              <div>
                                <h3 className="mb-1" style={{ color: '#333333' }}>
                                  {request.rewardName}
                                </h3>
                                <p className="text-sm" style={{ color: '#666666' }}>
                                  Điểm đã được hoàn lại
                                </p>
                              </div>
                            </div>
                            <Badge
                              className="rounded-full"
                              style={{ backgroundColor: '#FFE6E6', color: '#333333' }}
                            >
                              <XCircle className="w-3 h-3 mr-1" />
                              Từ chối
                            </Badge>
                          </div>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {requests.length === 0 && (
                <Card className="p-12 rounded-2xl border-0 text-center" style={{ backgroundColor: 'white' }}>
                  <div className="mb-4 text-6xl">🎯</div>
                  <h2 className="mb-2" style={{ color: '#333333' }}>
                    Chưa có quà nào
                  </h2>
                  <p style={{ color: '#666666' }}>
                    Hoàn thành nhiệm vụ để tích điểm đổi quà nhé!
                  </p>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Confirm Dialog */}
        <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Xác nhận đổi quà</DialogTitle>
              <DialogDescription>
                Con có chắc muốn đổi món quà này không?
              </DialogDescription>
            </DialogHeader>

            {selectedReward && (
              <div className="py-6">
                <Card className="p-6 rounded-2xl border-0 text-center" style={{ backgroundColor: '#F7F4EE' }}>
                  <div className="text-6xl mb-4">{selectedReward.icon}</div>
                  <h3 className="mb-2" style={{ color: '#333333' }}>
                    {selectedReward.name}
                  </h3>
                  {selectedReward.description && (
                    <p className="text-sm mb-4" style={{ color: '#666666' }}>
                      {selectedReward.description}
                    </p>
                  )}
                  <div
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full"
                    style={{ backgroundColor: '#FFD966' }}
                  >
                    <Star className="w-5 h-5" style={{ color: '#333333' }} />
                    <span style={{ color: '#333333' }}>
                      {selectedReward.pointsCost} điểm
                    </span>
                  </div>
                </Card>

                <div className="mt-6 p-4 rounded-xl" style={{ backgroundColor: '#E8F5FF' }}>
                  <div className="flex justify-between items-center mb-2">
                    <span style={{ color: '#666666' }}>Điểm hiện tại:</span>
                    <span style={{ color: '#333333' }}>
                      {userProgress?.totalPoints || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span style={{ color: '#666666' }}>Chi phí:</span>
                    <span style={{ color: '#333333' }}>
                      -{selectedReward.pointsCost}
                    </span>
                  </div>
                  <div className="h-px my-3" style={{ backgroundColor: '#333333', opacity: 0.2 }} />
                  <div className="flex justify-between items-center">
                    <span style={{ color: '#333333' }}>Sau khi đổi:</span>
                    <span style={{ color: '#333333' }}>
                      {(userProgress?.totalPoints || 0) - selectedReward.pointsCost}
                    </span>
                  </div>
                </div>

                <p className="text-sm text-center mt-4" style={{ color: '#666666' }}>
                  Ba mẹ cần duyệt yêu cầu này trước khi con nhận quà nhé! 🎉
                </p>
              </div>
            )}

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowConfirmDialog(false);
                  setSelectedReward(null);
                }}
              >
                Hủy
              </Button>
              <Button
                className="gap-2"
                style={{ backgroundColor: '#FFD966', color: '#333333' }}
                onClick={handleConfirmRedeem}
              >
                <Gift className="w-4 h-4" />
                Gửi yêu cầu!
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Celebration Animation */}
        <AnimatePresence>
          {showCelebration && (
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center"
              style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="p-12 rounded-3xl text-center"
                style={{ backgroundColor: 'white' }}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 180 }}
                transition={{ type: "spring", duration: 0.5 }}
              >
                <motion.div
                  className="text-8xl mb-4"
                  animate={{ rotate: [0, 10, -10, 10, 0] }}
                  transition={{ duration: 0.5, repeat: 3 }}
                >
                  🎉
                </motion.div>
                <h2 className="mb-2" style={{ color: '#333333' }}>
                  Request Sent!
                </h2>
                <p style={{ color: '#666666' }}>
                  Ask your parent to check it!
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
