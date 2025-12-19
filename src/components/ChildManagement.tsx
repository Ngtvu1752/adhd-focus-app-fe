// src/components/ChildManagement.tsx
import React, { useState, useEffect , useRef} from 'react';
import { Plus, User, Save, X } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { Label } from './ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from './ui/dialog';
import { toast } from 'sonner';
import authApi from '../api/authApi';

// Cập nhật Interface hiển thị
interface ChildAccount {
  id: string; // hoặc username nếu backend không trả id
  username: string;
  firstName: string;
  lastName: string; // Thêm lastName
}

interface ChildManagementProps {
  onSelectChild?: (child: ChildAccount) => void;
}

export function ChildManagement({ onSelectChild }: ChildManagementProps) {
  const [children, setChildren] = useState<ChildAccount[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState(''); // Thêm state cho Họ
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  

  useEffect(() => {
    loadChildren();
  }, []);

  const loadChildren = async () => {
    try {
      // Gọi API lấy danh sách
      const res: any = await authApi.getChildren();
      // Backend có thể trả về res.data hoặc res trực tiếp tùy cấu hình axios
      // Giả sử res là mảng các con
      if (Array.isArray(res) && res.length > 0) {
        setChildren(res);
      } else if (res.data && Array.isArray(res.data) && res.data.length > 0) {
         setChildren(res.data);
      } else {
        // Fallback mock data nếu không có dữ liệu từ API
        setChildren([
          { id: 'child1', username: 'bi_beo', firstName: 'Bi', lastName: 'Nguyễn' },
          { id: 'child2', username: 'bong_xinh', firstName: 'Bống', lastName: 'Trần' }
        ]);
      }
    } catch (error) {
      console.error("Failed to load children", error);
      // Fallback mock data khi lỗi
      setChildren([
        { id: 'child1', username: 'bi_beo', firstName: 'Bi', lastName: 'Nguyễn' },
        { id: 'child2', username: 'bong_xinh', firstName: 'Bống', lastName: 'Trần' }
      ]);
    }
  };
  const returnHeadPage = () => {
    const mainContainer = document.querySelector('main');
    if (mainContainer) {
      mainContainer.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  const handleCreateChild = async () => {
    if (!firstName || !lastName || !username || !password) {
      toast.error("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    setLoading(true);
    try {
      // 1. Gọi API tạo con với đúng tham số Backend yêu cầu
      await authApi.createChild({
        firstName,
        lastName,
        username,
        password
      });

      toast.success(`Đã tạo thành công tài khoản cho ${firstName} ${lastName}! 🎉`);
      
      // 2. Reset form
      setFirstName('');
      setLastName('');
      setUsername('');
      setPassword('');
      setIsDialogOpen(false);
      
      // 3. Reload danh sách để hiện bé mới
      loadChildren();

    } catch (error: any) {
      const msg = error.response?.data?.message || "Tạo tài khoản thất bại.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[#333333]">Danh sách tài khoản của con</h3>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#FFD966] text-[#333333] hover:bg-[#ffcf40] rounded-full">
              <Plus className="w-4 h-4 mr-2" />
              Thêm bé mới
            </Button>
          </DialogTrigger>
          
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Tạo tài khoản cho con</DialogTitle>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              {/* Hàng: Họ và Tên */}
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="lastName">Họ</Label>
                  <Input 
                    id="lastName" 
                    placeholder="Nguyễn" 
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="firstName">Tên</Label>
                  <Input 
                    id="firstName" 
                    placeholder="Văn An" 
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="username">Tên đăng nhập</Label>
                <Input 
                  id="username" 
                  placeholder="child_account" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Mật khẩu</Label>
                <Input 
                  id="password" 
                  type="password"
                  placeholder="********" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <DialogFooter>
               <DialogClose asChild>
                  <Button type="button" variant="ghost">Hủy</Button>
               </DialogClose>
              <Button onClick={handleCreateChild} disabled={loading} className="bg-[#FFD966] text-[#333333]">
                {loading ? 'Đang tạo...' : 'Lưu tài khoản'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Danh sách hiển thị */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4" ref={scrollContainerRef}>
        {children.length === 0 ? (
          <p className="text-gray-500 text-sm italic">Chưa có tài khoản nào.</p>
        ) : (
          children.map((child, index) => (
            <Card key={child.id || index} className="p-4 flex items-center justify-between bg-white border-l-4 border-l-[#FFD966] " ref={scrollContainerRef}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#E8F5FF] flex items-center justify-center">
                  <User className="w-6 h-6 text-[#333333]" />
                </div>
                <div>
                  {/* Hiển thị Họ và Tên đầy đủ */}
                  <p className="font-bold text-[#333333]">{child.lastName} {child.firstName}</p>
                  <p className="text-xs text-gray-500">@{child.username}</p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-xs text-blue-600"
                onClick={() => { if(onSelectChild) onSelectChild(child); returnHeadPage(); }}
              >
                Chi tiết
              </Button>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}