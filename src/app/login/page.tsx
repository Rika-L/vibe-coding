'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ThemeToggle } from '@/components/theme-toggle';
import { loginSchema } from '@/lib/validations/auth';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          fieldErrors[issue.path[0] as string] = issue.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        toast.success('登录成功');
        router.push(redirect);
      }
      else {
        toast.error(data.error || '登录失败');
      }
    }
    catch {
      toast.error('登录失败，请稍后重试');
    }
    finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">登录</CardTitle>
        <p className="text-sm text-muted-foreground">
          登录以查看您的睡眠数据
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium"
            >
              邮箱
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className={`w-full rounded-lg border bg-background px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 ${errors.email ? 'border-destructive' : 'border-border focus:border-primary'}`}
              placeholder="请输入邮箱"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-destructive">{errors.email}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium"
            >
              密码
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className={`w-full rounded-lg border bg-background px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 ${errors.password ? 'border-destructive' : 'border-border focus:border-primary'}`}
              placeholder="请输入密码"
            />
            {errors.password && (
              <p className="mt-1 text-sm text-destructive">{errors.password}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading
              ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    登录中...
                  </>
                )
              : (
                  '登录'
                )}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          还没有账号？
          {' '}
          <Link
            href="/register"
            className="text-primary hover:underline"
          >
            立即注册
          </Link>
        </div>

        <div className="mt-4 text-center">
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            返回首页
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-primary/5">
      <header className="fixed top-0 right-0 z-50 p-4">
        <ThemeToggle />
      </header>

      <div className="flex min-h-screen items-center justify-center px-4">
        <Suspense fallback={<div className="text-muted-foreground">加载中...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
