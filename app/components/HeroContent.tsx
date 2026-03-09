"use client";
import { motion, useScroll, useTransform } from "framer-motion";

export default function HeroContent({ desc }: { desc: string }) {
  const { scrollY } = useScroll();

  // 스크롤 0~300px 구간에서 각 레이어 이동
  const y1 = useTransform(scrollY, [0, 300], [0, -50]); // "기획자가" — 제일 빠름
  const y2 = useTransform(scrollY, [0, 300], [0, -28]); // "직접 만들기..." — 중간
  const y3 = useTransform(scrollY, [0, 300], [0, -12]); // 설명 — 제일 느림
  const opacity = useTransform(scrollY, [0, 180], [1, 0]);

  return (
    <>
      <h1 className="hero-title">
        <motion.span
          className="hero-gradient-1"
          style={{ display: "block", y: y1 }}
        >
          기획자가
        </motion.span>
        <motion.span
          className="hero-gradient-2"
          style={{ display: "block", y: y2 }}
        >
          직접 만들기 시작했다.
        </motion.span>
      </h1>
      <motion.p className="hero-desc" style={{ y: y3, opacity }}>
        {desc}
      </motion.p>
    </>
  );
}
