import { useTranslation } from "react-i18next";
import "@/i18n/i18n";

export default function QuestionBoard({ round }) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-row items-center justify-center">
      <div
        className="grid grow gap-3 rounded-3xl border-black bg-black lg:grid-flow-col lg:grid-rows-4"
        style={{ borderWidth: 12 }}
      >
        {round.answers.map((x, index) => (
          <div
            key={`qboard-answer-${index}`}
            className=" items-center rounded border-2 text-center font-extrabold uppercase"
          >
            {x.trig ? (
              // answered question
              <div className="h-full bg-gradient-to-t from-primary-900 via-primary-500 to-primary-700">
                <div className="flex h-full items-center justify-center">
                  <p
                    id={`answer${index}Answered`}
                    className="grow px-5 text-2xl text-white"
                    style={{ textShadow: "1px 2px 4px black" }}
                  >
                    {x.ans}
                  </p>
                  <div className="flex h-full items-center justify-center border-l-2 bg-gradient-to-t from-primary-700 to-primary-500 p-5 text-center">
                    <p
                      className="text-4xl text-white"
                      style={{ textShadow: "1px 2px 4px black" }}
                      id={`answer${index}PointsText`}
                    >
                      {t("number", { count: x.pnt })}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              // unanswered question
              <div className="flex h-full items-center justify-center bg-gradient-to-t from-primary-700 to-primary-500 py-3 ">
                <div
                  className="inline-block items-center justify-center rounded-full border-2 bg-gradient-to-tr from-primary-900 to-primary-700
                      px-5 py-2"
                  style={{ boxShadow: "3px 3px 2px black" }}
                >
                  <p
                    id={`answer${index}UnAnswered`}
                    className="self-center text-4xl font-black text-white"
                    style={{ textShadow: "1px 2px 4px black" }}
                  >
                    {t("number", { count: index + 1 })}
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
