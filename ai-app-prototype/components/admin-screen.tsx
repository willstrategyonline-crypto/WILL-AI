"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
  ArrowLeft, 
  Check, 
  Trash2, 
  Users, 
  Infinity,
  Clock,
  CheckCircle2,
  XCircle
} from "lucide-react";

interface Student {
  id: string;
  email: string;
  name: string;
  registeredAt: Date;
  isApproved: boolean;
  isUnlimited: boolean;
  questionsUsed: number;
}

interface AdminScreenProps {
  onBack: () => void;
}

export function AdminScreen({ onBack }: AdminScreenProps) {
  const [students, setStudents] = useState<Student[]>([
    {
      id: "1",
      email: "tanaka@example.com",
      name: "田中太郎",
      registeredAt: new Date(2024, 0, 10),
      isApproved: true,
      isUnlimited: false,
      questionsUsed: 5,
    },
    {
      id: "2",
      email: "suzuki@example.com",
      name: "鈴木花子",
      registeredAt: new Date(2024, 0, 12),
      isApproved: true,
      isUnlimited: true,
      questionsUsed: 23,
    },
    {
      id: "3",
      email: "sato@example.com",
      name: "佐藤健",
      registeredAt: new Date(2024, 0, 15),
      isApproved: false,
      isUnlimited: false,
      questionsUsed: 0,
    },
    {
      id: "4",
      email: "yamamoto@example.com",
      name: "山本美咲",
      registeredAt: new Date(2024, 0, 14),
      isApproved: true,
      isUnlimited: false,
      questionsUsed: 8,
    },
    {
      id: "5",
      email: "watanabe@example.com",
      name: "渡辺大輔",
      registeredAt: new Date(2024, 0, 16),
      isApproved: false,
      isUnlimited: false,
      questionsUsed: 0,
    },
  ]);

  const handleApprove = (studentId: string) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, isApproved: true } : s))
    );
  };

  const handleToggleUnlimited = (studentId: string) => {
    setStudents((prev) =>
      prev.map((s) =>
        s.id === studentId ? { ...s, isUnlimited: !s.isUnlimited } : s
      )
    );
  };

  const handleDelete = (studentId: string) => {
    setStudents((prev) => prev.filter((s) => s.id !== studentId));
  };

  const approvedCount = students.filter((s) => s.isApproved).length;
  const pendingCount = students.filter((s) => !s.isApproved).length;
  const unlimitedCount = students.filter((s) => s.isUnlimited).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-foreground">管理者画面</h1>
              <p className="text-sm text-muted-foreground">生徒の管理</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">承認済み生徒</p>
                  <p className="text-2xl font-bold text-foreground">{approvedCount}人</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">承認待ち</p>
                  <p className="text-2xl font-bold text-foreground">{pendingCount}人</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                  <Infinity className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">無制限プラン</p>
                  <p className="text-2xl font-bold text-foreground">{unlimitedCount}人</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Students Table */}
        <Card>
          <CardHeader>
            <CardTitle>登録生徒一覧</CardTitle>
            <CardDescription>生徒の承認、プラン変更、削除を行えます</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="w-full">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>状態</TableHead>
                    <TableHead>名前</TableHead>
                    <TableHead>メールアドレス</TableHead>
                    <TableHead>登録日</TableHead>
                    <TableHead>質問数</TableHead>
                    <TableHead>無制限</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell>
                        {student.isApproved ? (
                          <Badge variant="default" className="bg-green-100 text-green-700 hover:bg-green-100">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            承認済
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-amber-100 text-amber-700">
                            <Clock className="w-3 h-3 mr-1" />
                            保留中
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{student.name}</TableCell>
                      <TableCell className="text-muted-foreground">{student.email}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {student.registeredAt.toLocaleDateString("ja-JP")}
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{student.questionsUsed}</span>
                        <span className="text-muted-foreground">
                          {student.isUnlimited ? "" : " / 10"}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={student.isUnlimited}
                            onCheckedChange={() => handleToggleUnlimited(student.id)}
                            disabled={!student.isApproved}
                          />
                          {student.isUnlimited && (
                            <Infinity className="w-4 h-4 text-accent" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {!student.isApproved && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-green-600 border-green-200 hover:bg-green-50"
                              onClick={() => handleApprove(student.id)}
                            >
                              <Check className="w-4 h-4 mr-1" />
                              承認
                            </Button>
                          )}
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-destructive border-destructive/30 hover:bg-destructive/10"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>生徒を削除しますか？</AlertDialogTitle>
                                <AlertDialogDescription>
                                  {student.name}（{student.email}）を削除します。
                                  この操作は取り消せません。
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>キャンセル</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  onClick={() => handleDelete(student.id)}
                                >
                                  削除する
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
