type Props = {
  params: Promise<{ trial: string }>;
};

export default async function TrialPage({ params }: Props) {
  const { trial } = await params;

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          ReferralBridge
        </h1>
        <p className="text-lg text-gray-600">
          Trial: <span className="font-mono font-semibold">{trial}</span>
        </p>
      </div>
    </main>
  );
}
