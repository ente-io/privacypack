import { ArrowRight } from "lucide-react";
import Image from "next/image";
import React from "react";
import { PRIVACY_PACK_FONT_FAMILY } from "@/lib/utils";

interface PrivacyPackResultProps {
    pack: Array<{
        category: string;
        order: number;
        mainstream_app_name: string;
        mainstream_app_id: string;
        private_alternatives: Array<{
            id: string;
            name: string;
        }>;
    }>;
}

const PrivacyPackResult: React.FC<PrivacyPackResultProps> = ({ pack }) => {
    const layout =
        pack.length <= 12
            ? {
                  gridTop: "200px",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  columnGap: "110px",
                  rowGap: "56px",
                  cardClass: "h-[270px] w-[380px] pt-6",
                  logoClass: "h-[150px] w-[150px]",
                  textClass: "max-w-[150px] text-[28px]",
                  multiTextClass: "max-w-[190px] text-[22px]",
                  arrowClass: "-mt-20",
                  arrowSize: 42,
              }
            : pack.length <= 20
              ? {
                    gridTop: "200px",
                    gridTemplateColumns: "repeat(4, 1fr)",
                    columnGap: "72px",
                    rowGap: "76px",
                    cardClass: "h-[190px] w-[290px] pt-6",
                    logoClass: "h-[120px] w-[120px]",
                    textClass: "max-w-[120px] text-[25px]",
                    multiTextClass: "max-w-[150px] text-[18px]",
                    arrowClass: "-mt-12",
                    arrowSize: 32,
                }
              : {
                    gridTop: "170px",
                    gridTemplateColumns: "repeat(5, 1fr)",
                    columnGap: "42px",
                    rowGap: "32px",
                    cardClass: "h-[150px] w-[240px] pt-4",
                    logoClass: "h-[84px] w-[84px]",
                    textClass: "max-w-[86px] text-[18px]",
                    multiTextClass: "max-w-[96px] text-[13px]",
                    arrowClass: "-mt-11",
                    arrowSize: 26,
                };

    const getAlternativeLabel = (
        alternatives: Array<{ id: string; name: string }>,
    ) => alternatives.map((alternative) => alternative.name).join(" + ");

    return (
        <div
            style={{
                display: "none",
                width: "1500px",
                height: "1500px",
                backgroundColor: "#121212",
                position: "relative",
                boxSizing: "border-box",
                overflow: "hidden",
                fontFamily: PRIVACY_PACK_FONT_FAMILY,
            }}
            id="privacy-pack-result-to-capture"
        >
            <div
                style={{
                    position: "absolute",
                    top: "48px",
                    left: "48px",
                    right: "55px",
                    height: "72px",
                }}
            >
                <div
                    style={{
                        position: "absolute",
                        left: "0",
                        top: "0",
                    }}
                >
                    <Image
                        src="/url-logo.png"
                        alt="PrivacyPack Logo"
                        width={474}
                        height={72}
                    />
                </div>

                <div
                    style={{
                        position: "absolute",
                        right: "0",
                        top: "-16px",
                        width: "130px",
                        height: "92px",
                    }}
                >
                    <Image
                        src="/small-logo.png"
                        alt="Privacy Pack logo"
                        width={0}
                        height={0}
                        sizes="100vw"
                        className="h-auto w-full"
                    />
                </div>
            </div>

            <div
                style={{
                    position: "absolute",
                    top: layout.gridTop,
                    left: "48px",
                    right: "48px",
                    display: "grid",
                    gridTemplateColumns: layout.gridTemplateColumns,
                    columnGap: layout.columnGap,
                    rowGap: layout.rowGap,
                    justifyItems: "center",
                }}
            >
                {pack.map((item) => {
                    const alternatives = item.private_alternatives;
                    const hasMultipleAlternatives = alternatives.length > 1;

                    return (
                        <div
                            key={item.category}
                            className={`${layout.cardClass} group relative flex flex-row items-center justify-between rounded-md transition`}
                        >
                            <div className="flex h-full flex-col items-center transition outline-none">
                                <div className={layout.logoClass}>
                                    <Image
                                        src={`/app-logos/${item.mainstream_app_id}.jpg`}
                                        alt={item.mainstream_app_name}
                                        width={0}
                                        height={0}
                                        sizes="100vw"
                                        className="h-full w-full rounded-2xl object-cover"
                                    />
                                </div>
                                <div
                                    className={`${layout.textClass} mt-3 text-center leading-tight break-words text-[#aeaeae]`}
                                >
                                    {item.mainstream_app_name}
                                </div>
                            </div>
                            <div className={layout.arrowClass}>
                                <ArrowRight
                                    size={layout.arrowSize}
                                    className="text-[#e6e6e6]"
                                />
                            </div>
                            <div className="flex h-full flex-col items-center transition outline-none">
                                <div className={layout.logoClass}>
                                    {hasMultipleAlternatives ? (
                                        <div className="grid h-full w-full grid-cols-2 place-items-center gap-2">
                                            {alternatives.map((alternative) => (
                                                <div
                                                    key={alternative.id}
                                                    className="aspect-square w-full overflow-hidden rounded-xl bg-white/5"
                                                >
                                                    <Image
                                                        src={`/app-logos/${alternative.id}.jpg`}
                                                        alt={alternative.name}
                                                        width={0}
                                                        height={0}
                                                        sizes="120px"
                                                        className="h-full w-full object-contain"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <Image
                                            src={`/app-logos/${alternatives[0].id}.jpg`}
                                            alt={alternatives[0].name}
                                            width={0}
                                            height={0}
                                            sizes="100vw"
                                            className="h-full w-full rounded-2xl object-cover"
                                        />
                                    )}
                                </div>
                                <div
                                    className={`${
                                        hasMultipleAlternatives
                                            ? layout.multiTextClass
                                            : layout.textClass
                                    } mt-3 text-center leading-tight break-words text-[#aeaeae]`}
                                >
                                    {getAlternativeLabel(alternatives)}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default PrivacyPackResult;
