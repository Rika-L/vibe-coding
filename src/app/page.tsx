"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Upload, FileUp, Loader2 } from "lucide-react";

export default function Home() {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleUpload = async (file: File) => {
    if (!file.name.endsWith(".csv")) {
      alert("请上传 CSV 文件");
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
        alert(`成功导入 ${data.count} 条记录`);
        router.push("/dashboard");
      } else {
        alert(data.error || "上传失败");
      }
    } catch (error) {
      alert("上传出错，请重试");
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="mb-4 text-4xl font-bold text-gray-900 dark:text-white">
            睡眠质量分析平台
          </h1>
          <p className="mb-12 text-lg text-gray-600 dark:text-gray-300">
            上传你的睡眠数据，获取 AI 智能分析报告
          </p>

          <div
            className={`rounded-2xl border-2 border-dashed p-12 transition-all ${
              dragActive
                ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20"
                : "border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-800"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center gap-4">
              <div className="rounded-full bg-indigo-100 p-4 dark:bg-indigo-900/30">
                {isUploading ? (
                  <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                ) : (
                  <Upload className="h-8 w-8 text-indigo-600" />
                )}
              </div>

              <div className="text-center">
                <p className="mb-2 text-lg font-medium text-gray-900 dark:text-white">
                  {isUploading ? "正在上传..." : "拖拽 CSV 文件到这里"}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  或点击选择文件
                </p>
              </div>

              <label className="cursor-pointer">
                <input
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={handleChange}
                  disabled={isUploading}
                />
                <span className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 font-medium text-white transition-colors hover:bg-indigo-700">
                  <FileUp className="h-4 w-4" />
                  选择文件
                </span>
              </label>
            </div>
          </div>

          <div className="mt-12 grid grid-cols-3 gap-6 text-center">
            <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
              <div className="mb-2 text-3xl font-bold text-indigo-600">AI</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">智能分析</div>
            </div>
            <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
              <div className="mb-2 text-3xl font-bold text-indigo-600">📊</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">可视化图表</div>
            </div>
            <div className="rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
              <div className="mb-2 text-3xl font-bold text-indigo-600">💡</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">改善建议</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
