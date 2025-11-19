"use client";
import Link from "next/link";
import React from "react";

export const Logo = () => {
  return (
    <Link
      href="/"
      className="font-normal flex space-x-2 items-center text-sm mr-4 px-2 py-1 relative z-20 text-white transition-opacity hover:opacity-80"
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
      >
        {/* 搜索放大镜圆圈 */}
        <circle
          cx="10"
          cy="10"
          r="7"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
        />
        {/* 搜索放大镜手柄 */}
        <path
          d="M15 15L21 21"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        {/* 内部人像轮廓 */}
        <circle
          cx="10"
          cy="9"
          r="2"
          fill="currentColor"
        />
        <path
          d="M6.5 14C6.5 12.5 8 11.5 10 11.5C12 11.5 13.5 12.5 13.5 14"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
      <span className="font-semibold text-white">FindMe</span>
    </Link>
  );
};
