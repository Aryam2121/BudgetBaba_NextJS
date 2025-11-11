import type React from "react"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="light !bg-gray-50" data-theme="light" style={{ colorScheme: 'light' }}>
      {children}
    </div>
  )
}
