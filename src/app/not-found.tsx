import Link from "next/link";
import { AlertTriangle, Home, Radio } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-void relative overflow-hidden flex items-center justify-center">
      {/* Ambient background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[800px] h-[800px] bg-quantum/4 rounded-full blur-[150px] float-animation" />
        <div
          className="absolute top-1/3 -right-20 w-[600px] h-[600px] bg-plasma/4 rounded-full blur-[130px] float-animation"
          style={{ animationDelay: "-3s" }}
        />
        <div
          className="absolute -bottom-40 left-1/3 w-[700px] h-[700px] bg-nebula-pink/3 rounded-full blur-[140px] float-animation"
          style={{ animationDelay: "-5s" }}
        />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(rgba(167, 139, 250, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(167, 139, 250, 0.3) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      {/* Scanline effect */}
      <div className="fixed inset-0 pointer-events-none scanline opacity-20" />

      {/* Main content */}
      <main className="relative z-10 max-w-lg mx-auto px-4 sm:px-6 text-center">
        {/* 404 number */}
        <div className="mb-6">
          <span className="block text-[10rem] sm:text-[12rem] font-serif font-bold leading-none gradient-text select-none">
            404
          </span>
        </div>

        {/* Card */}
        <div className="bg-abyss/50 backdrop-blur-sm border border-quantum/10 rounded-2xl p-8 sm:p-10">
          {/* Icon */}
          <div className="w-14 h-14 rounded-full bg-quantum/10 border border-quantum/20 flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-7 h-7 text-quantum/60" />
          </div>

          {/* Message */}
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-signal mb-3">
            你穿越到了不存在的维度
          </h2>
          <p className="text-sm sm:text-base text-void-text/70 leading-relaxed mb-8">
            这个维度的时空坐标似乎不存在于我们的量子数据库中。也许你在寻找的日报已经被平行宇宙的熵增吞噬了。
          </p>

          {/* Divider */}
          <div className="relative mb-8">
            <div className="h-px bg-gradient-to-r from-transparent via-quantum/20 to-transparent" />
            <div className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 px-3 bg-abyss/50">
              <Radio className="w-3.5 h-3.5 text-quantum/30" />
            </div>
          </div>

          {/* CTA Button */}
          <Link
            href="/"
            className="group inline-flex items-center gap-2.5 px-7 py-3 bg-gradient-to-r from-quantum to-quantum-dim text-void font-medium rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-quantum/20 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Home className="w-4 h-4 transition-transform group-hover:-translate-y-0.5" />
            <span className="text-sm">返回首页</span>
          </Link>
        </div>

        {/* Bottom status text */}
        <p className="mt-8 text-[11px] font-mono text-static/30">
          ERROR_CODE: DIMENSION_NOT_FOUND &middot; 维度 404-void
        </p>
      </main>
    </div>
  );
}
