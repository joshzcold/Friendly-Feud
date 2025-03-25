const Team = ({ team, players }) => {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl bg-secondary-500 text-center shadow-lg">
      <p className="rounded-t-xl bg-secondary-700 py-2 text-4xl font-bold text-foreground shadow-sm" id="team-name">
        {team}
      </p>
      <div className="relative min-h-0 flex-1">
        <div className="absolute inset-0 overflow-y-auto">
          <div className="flex flex-row flex-wrap justify-center px-2">
            {players.map((m, index) => (
              <div key={`${m}-${index}`} className="m-2 w-20 rounded-lg bg-primary-200 p-2 xl:w-28">
                <p className="truncate font-bold text-foreground">{m}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Team;
