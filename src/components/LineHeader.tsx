const LineHeader = () => {
  return (
    <div className="flex items-center gap-3 border-b border-border bg-card px-6 py-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary">
        <span className="text-lg font-bold text-primary-foreground">L</span>
      </div>
      <div>
        <h1 className="text-lg font-semibold text-foreground">LINE</h1>
        <p className="text-xs text-muted-foreground">即時互動，建立更緊密的客戶關係</p>
      </div>
    </div>
  );
};

export default LineHeader;
