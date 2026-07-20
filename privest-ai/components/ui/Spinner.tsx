"use client";

export default function Spinner({ size = 16 }: { size?: number }) {
  return (
    <div
      className="rounded-full border-2 border-grey-light border-t-teal animate-privest-spinner"
      style={{ width: size, height: size }}
    />
  );
}
