"use client";

import Link from "next/link";
import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Upload, FileUp, Loader2, Moon, Brain, BarChart3, Lightbulb, LogIn } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Home() {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    if (!file.name.endsWith(".csv")) {
      toast.error("请上传 CSV 文件");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        if (data.failedCount > 0) {
          toast.warning(`成功导入 ${data.count} 条记录，${data.failedCount} 条失败`);
        } else {
          toast.success(`成功导入 ${data.count} 条记录`);
        }
        router.push("/dashboard");
      } else {
        toast.error(data.error || "上传失败");
      }
    } catch (error) {
      toast.error("上传出错，请重试");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files?.[0]) {
      handleUpload(e.dataTransfer.files[0]);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      handleUpload(e.target.files[0]);
    }
  };

  const handleButtonClick = () => {
    if (!isUploading && inputRef.current) {
      inputRef.current.value = ""; // 允许重复选择同一文件
      inputRef.current.click();
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="fixed top-0 right-0 z-50 flex items-center gap-2 p-4">
        <Link href="/login">
          <Button variant="outline" size="sm" className="gap-2">
            <LogIn className="h-4 w-4" />
            登录
          </Button>
        </Link>
        <ThemeToggle />
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-20">
        <div className="mx-auto max-w-2xl text-center">
          {/* Hero Section */}
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
            <Moon className="h-4 w-4" />
            睡眠健康智能分析
          </div>

          <h1 className="mb-6 text-5xl font-bold tracking-tight text-foreground md:text-6xl">
            睡眠质量分析平台
          </h1>

          <p className="mb-12 text-lg text-muted-foreground md:text-xl">
            上传你的睡眠数据，获取 AI 智能分析报告
            <br />
            了解睡眠模式，改善睡眠质量
          </p>

          {/* Upload Area */}
          <Card
            className={`mx-auto max-w-xl transition-all duration-300 ${
              dragActive
                ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                : "border-border/50 bg-card/50 backdrop-blur-sm"
            }`}
          >
            <CardContent className="p-8">
              <div
                className="flex flex-col items-center gap-6"
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <div
                  className={`rounded-2xl p-6 transition-all duration-300 ${
                    dragActive
                      ? "bg-primary/20 scale-110"
                      : "bg-primary/10"
                  }`}
                >
                  {isUploading ? (
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                  ) : (
                    <Upload className="h-10 w-10 text-primary" />
                  )}
                </div>

                <div className="text-center">
                  <p className="mb-2 text-xl font-semibold text-foreground">
                    {isUploading ? "正在上传..." : "拖拽 CSV 文件到这里"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    或点击下方按钮选择文件
                  </p>
                </div>

                <input
                  ref={inputRef}
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={handleChange}
                  disabled={isUploading}
                />
                <Button
                  size="lg"
                  className="gap-2 px-8"
                  disabled={isUploading}
                  onClick={handleButtonClick}
                >
                  <FileUp className="h-4 w-4" />
                  选择文件
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Features */}
          <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-3">
            <FeatureCard
              icon={Brain}
              title="AI 智能分析"
              description="基于大模型深度分析睡眠数据"
            />
            <FeatureCard
              icon={BarChart3}
              title="可视化图表"
              description="直观展示睡眠趋势与结构"
            />
            <FeatureCard
              icon={Lightbulb}
              title="改善建议"
              description="个性化睡眠改善方案"
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="fixed bottom-0 w-full border-t border-border/50 bg-background/80 backdrop-blur-sm py-4">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          睡眠质量分析平台 — 让每一夜都有好梦
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <Card className="group border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
      <CardContent className="flex flex-col items-center gap-4 p-6">
        <div className="rounded-xl bg-primary/10 p-4 transition-transform duration-300 group-hover:scale-110">
          <Icon className="h-6 w-6 text-primary" />
        </div>
        <div className="text-center">
          <h3 className="mb-1 font-semibold text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}
