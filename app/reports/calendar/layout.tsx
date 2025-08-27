export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-purple-100 w-full min-h-screen flex flex-col">
      <div className="flex-1 min-h-0 m-3 p-6 bg-white border border-purple-200 rounded-2xl shadow-lg flex flex-col">
        {children}
      </div>
    </div>
  );
}
