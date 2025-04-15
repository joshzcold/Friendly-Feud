import { useTranslation } from 'react-i18next';

const BuzzerTable = ({ game }) => {
  const { t } = useTranslation();

  if (!game?.buzzed) return null;

  return (
    <table className="w-full">
      <thead>
        <tr className="text-left text-foreground">
          <th>#</th>
          <th>{t('team')}</th>
          <th>{t('player')}</th>
          <th>{t('time')}</th>
        </tr>
      </thead>
      <tbody>
        {game.buzzed.length > 0 && game.buzzed.map((buzz, index) => (
          <tr key={`buzzer-${buzz.id}-${index}`}>
            <td id={`playerBuzzed${index}NumberText`} className="text-left text-foreground">
              {t('number', { count: index + 1 })}
            </td>

            <td id={`playerBuzzed${index}TeamNameText`} className="text-left text-foreground">
              {game.teams[game.registeredPlayers[buzz.id]?.team]?.name}
            </td>

            <td id={`playerBuzzed${index}NameText`} className="text-left text-foreground">
              {game.registeredPlayers[buzz.id]?.name}
            </td>

            <td id={`playerBuzzer${index}BuzzerTimeText`} className="text-left text-foreground">
              {((buzz.time - game.round_start_time) / 1000).toFixed(2)}s
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default BuzzerTable;
