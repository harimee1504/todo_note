import { Toaster } from "@/components/ui/toaster";


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <div className="h-full w-full flex flex-col">
          {children}
          <Toaster />
      </div>
  );
}
