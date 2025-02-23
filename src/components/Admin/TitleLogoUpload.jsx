import { useTranslation } from "react-i18next";
import { Buffer } from "buffer";
import { FileUp } from "lucide-react";
import { Image } from "next/image";

function BeforeUpload({ send, room, setGame, game, setError, setImageUploaded }) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-row items-center space-x-2">
      <div className="image-upload">
        <label htmlFor="logoUpload">
          <FileUp className="cursor-pointer text-secondary-900 hover:text-secondary-500" size={38} />
        </label>
        <input
          className="hidden"
          type="file"
          accept="image/png, image/jpeg, image/gif"
          id="logoUpload"
          onChange={(e) => {
            var file = document.getElementById("logoUpload").files[0];

            if (file) {
              if (file.size > process.env.NEXT_PUBLIC_MAX_IMAGE_UPLOAD_SIZE_MB * 1024 * 1024) {
                console.error("Logo image is too large");
                setError(t(ERROR_CODES.IMAGE_TOO_LARGE, { message: "2MB" }));
                return;
              }
              var reader = new FileReader();
              let rawData = new ArrayBuffer();
              reader.onload = function (evt) {
                rawData = evt.target.result;
                var headerarr = new Uint8Array(evt.target.result).subarray(0, 4);
                var header = "";
                for (var i = 0; i < headerarr.length; i++) {
                  header += headerarr[i].toString(16);
                }
                let mimetype = "";
                switch (header) {
                  case "89504e47":
                    mimetype = "png";
                    break;
                  case "47494638":
                    mimetype = "gif";
                    break;
                  case "ffd8ffe0":
                  case "ffd8ffe1":
                  case "ffd8ffe2":
                  case "ffd8ffe3":
                  case "ffd8ffe8":
                    mimetype = "jpeg";
                    break;
                  default:
                    setError(t(ERROR_CODES.UNKNOWN_FILE_TYPE));
                    return;
                }

                const bufferData = Buffer.from(rawData).toString("base64");
                send({
                  action: "logo_upload",
                  logoData: bufferData,
                  mimetype: mimetype,
                });
                setImageUploaded(file);
                game.settings.logo_url = `/api/rooms/${room}/logo`;
                setGame((prv) => ({ ...prv }));
                send({ action: "data", data: game });
              };
              reader.readAsArrayBuffer(file);
            }
            document.getElementById("logoUpload").value = null;
          }}
        />
      </div>
      <div>
        <p className="text-s text-secondary-900">{t("logo upload")}</p>
        <p className="text-xs text-secondary-900">{t("(must be smaller than 2MB)")}</p>
      </div>
    </div>
  );
}

function AfterUpload({ send, room, game, setGame, setImageUploaded, imageUploaded }) {
  return (
    <div className="flex flex-row items-center space-x-2">
      <p className="capitalize text-foreground">logo:</p>
      <Image
        width={150}
        height={150}
        style={{ objectFit: "contain" }}
        src={URL.createObjectURL(imageUploaded)}
        alt="Game Logo"
      />
      <button
        className="rounded-lg border-2 bg-secondary-500 p-1 hover:bg-secondary-700"
        id="deleteLogoButton"
        onClick={(e) => {
          send({
            action: "del_logo_upload",
            room: room,
          });
          URL.revokeObjectURL(imageUploaded);
          setImageUploaded(null);
          game.settings.logo_url = null;
          setGame((prv) => ({ ...prv }));
          send({ action: "data", data: game });
        }}
      >
        {/* cancel.svg */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          preserveAspectRatio="xMidYMid meet"
          viewBox="0 0 717 718"
        >
          <path
            d="M651.22 154c98 139 85 334-40 459s-318 137-458 40c-16-12-34-26-49-40c-15-15-28-32-39-49c-98-139-86-334 39-459s319-137 459-40c16 12 33 26 48 40c15 15 29 32 40 49zm-522 345l370-370c-104-63-242-50-331 39c-90 90-102 228-39 331zm458-280l-370 369c104 63 242 50 331-39c90-90 102-227 39-330z"
            fill="#ffffff"
          />
          <rect x="0" y="0" width="717" height="718" fill="rgba(0, 0, 0, 0)" />
        </svg>
      </button>
    </div>
  );
}

function TitleLogoUpload({ send, room, setGame, game, setError, setImageUploaded, imageUploaded }) {
  return imageUploaded === null
    ? <BeforeUpload send={send} room={room} game={game} setGame={setGame} setError={setError} setImageUploaded={setImageUploaded} />
    : <AfterUpload send={send} room={room} game={game} setGame={setGame} setImageUploaded={setImageUploaded} imageUploaded={imageUploaded} />;
}

export default TitleLogoUpload;