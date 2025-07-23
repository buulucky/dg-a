"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: 'user' | 'admin';
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  approved_at?: string;
}

export function AdminPanel() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setUsers(data || []);
      } catch (error) {
        console.error('Error loading users:', error);
      } finally {
        setLoading(false);
      }
    };

    const checkAuthAndLoadUsers = async () => {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
          router.push('/auth/login');
          return;
        }

        // ตรวจสอบว่าเป็น admin หรือไม่
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError || !profile || profile.role !== 'admin' || profile.status !== 'approved') {
          router.push('/protected');
          return;
        }

        setCurrentUser(profile);
        await loadUsers();
      } catch (error) {
        console.error('Error checking auth:', error);
        router.push('/auth/login');
      }
    };

    checkAuthAndLoadUsers();
    
    // Listen สำหรับ auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        // ไม่ต้อง redirect ที่นี่ เพราะ AuthButton จะจัดการให้แล้ว
        setCurrentUser(null);
        setUsers([]);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [router, supabase]); // แก้ไข dependency array

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  type UpdateData = {
    status: 'approved' | 'rejected';
    approved_by: string;
    approved_at: string;
  };

  const updateUserStatus = async (userId: string, status: 'approved' | 'rejected') => {
    if (!currentUser) return;

    setProcessingId(userId);
    try {
      const updateData: UpdateData = {
        status,
        approved_by: currentUser.id,
        approved_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('user_profiles')
        .update(updateData)
        .eq('id', userId);

      if (error) throw error;

      await loadUsers();
    } catch (error) {
      console.error('Error updating user status:', error);
      alert('เกิดข้อผิดพลาดในการอัพเดทสถานะ');
    } finally {
      setProcessingId(null);
    }
  };

  const updateUserRole = async (userId: string, role: 'user' | 'admin') => {
    if (!currentUser) return;

    setProcessingId(userId);
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ role })
        .eq('id', userId);

      if (error) throw error;

      await loadUsers();
    } catch (error) {
      console.error('Error updating user role:', error);
      alert('เกิดข้อผิดพลาดในการอัพเดทบทบาท');
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">รออนุมัติ</Badge>;
      case 'approved':
        return <Badge variant="default" className="bg-green-500">อนุมัติแล้ว</Badge>;
      case 'rejected':
        return <Badge variant="destructive">ปฏิเสธ</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge variant="default" className="bg-blue-500">ผู้ดูแลระบบ</Badge>;
      case 'user':
        return <Badge variant="outline">ผู้ใช้ทั่วไป</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return null;
  }

  const pendingUsers = users.filter(user => user.status === 'pending');
  const approvedUsers = users.filter(user => user.status === 'approved');
  const rejectedUsers = users.filter(user => user.status === 'rejected');

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">จัดการสมาชิก</h1>
        <div className="text-sm text-muted-foreground">
          ผู้ดูแลระบบ: {currentUser.full_name}
        </div>
      </div>

      {/* สถิติ */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">ทั้งหมด</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">รออนุมัติ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{pendingUsers.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">อนุมัติแล้ว</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{approvedUsers.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">ปฏิเสธ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{rejectedUsers.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* รายการผู้ใช้รออนุมัติ */}
      {pendingUsers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>สมาชิกรออนุมัติ ({pendingUsers.length})</CardTitle>
            <CardDescription>สมาชิกใหม่ที่รอการอนุมัติจากผู้ดูแลระบบ</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <div className="font-medium">{user.full_name}</div>
                    <div className="text-sm text-muted-foreground">{user.email}</div>
                    <div className="text-xs text-muted-foreground">
                      สมัครเมื่อ: {new Date(user.created_at).toLocaleDateString('th-TH')}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(user.status)}
                    <Button
                      size="sm"
                      onClick={() => updateUserStatus(user.id, 'approved')}
                      disabled={processingId === user.id}
                      className="bg-green-500 hover:bg-green-600"
                    >
                      อนุมัติ
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => updateUserStatus(user.id, 'rejected')}
                      disabled={processingId === user.id}
                    >
                      ปฏิเสธ
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* รายการสมาชิกทั้งหมด */}
      <Card>
        <CardHeader>
          <CardTitle>สมาชิกทั้งหมด</CardTitle>
          <CardDescription>จัดการสมาชิกและบทบาทในระบบ</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <div className="font-medium">{user.full_name}</div>
                  <div className="text-sm text-muted-foreground">{user.email}</div>
                  <div className="flex gap-2">
                    {getStatusBadge(user.status)}
                    {getRoleBadge(user.role)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    สมัครเมื่อ: {new Date(user.created_at).toLocaleDateString('th-TH')}
                    {user.approved_at && (
                      <> | อนุมัติเมื่อ: {new Date(user.approved_at).toLocaleDateString('th-TH')}</>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {user.id !== currentUser.id && (
                    <>
                      {user.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => updateUserStatus(user.id, 'approved')}
                            disabled={processingId === user.id}
                            className="bg-green-500 hover:bg-green-600"
                          >
                            อนุมัติ
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => updateUserStatus(user.id, 'rejected')}
                            disabled={processingId === user.id}
                          >
                            ปฏิเสธ
                          </Button>
                        </>
                      )}
                      {user.status === 'approved' && (
                        <>
                          {user.role === 'user' ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateUserRole(user.id, 'admin')}
                              disabled={processingId === user.id}
                            >
                              เลื่อนเป็นแอดมิน
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateUserRole(user.id, 'user')}
                              disabled={processingId === user.id}
                            >
                              ปลดเป็นผู้ใช้
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => updateUserStatus(user.id, 'rejected')}
                            disabled={processingId === user.id}
                          >
                            ระงับ
                          </Button>
                        </>
                      )}
                      {user.status === 'rejected' && (
                        <Button
                          size="sm"
                          onClick={() => updateUserStatus(user.id, 'approved')}
                          disabled={processingId === user.id}
                          className="bg-green-500 hover:bg-green-600"
                        >
                          คืนสิทธิ์
                        </Button>
                      )}
                    </>
                  )}
                  {user.id === currentUser.id && (
                    <Badge variant="outline">ตัวคุณเอง</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
