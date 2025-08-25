import { ArrowRight } from "lucide-react";
import Image from "next/image";
import React from "react";

interface PrivacyPackResultProps {
    pack: Array<{
        category: string;
        order: number;
        mainstream_app_name: string;
        mainstream_app_id: string;
        private_alternative_name: string;
        private_alternative_id: string;
    }>;
}

const PrivacyPackResult: React.FC<PrivacyPackResultProps> = ({ pack }) => {
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
                fontFamily: "monospace",
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
                        priority
                    />
                </div>
            </div>

            <div
                style={{
                    position: "absolute",
                    top: "200px",
                    left: "48px",
                    right: "48px",
                    display: "grid",
                    gridTemplateColumns:
                        pack.length <= 12 ? "repeat(3, 1fr)" : "repeat(4, 1fr)",
                    columnGap: pack.length <= 12 ? "110px" : "72px",
                    rowGap: pack.length <= 12 ? "56px" : "76px",
                    justifyItems: "center",
                }}
            >
                {pack.map((item) => {
                    return (
                        <div
                            key={item.category}
                            className={`${pack.length <= 12 ? "h-[270px] w-[380px]" : "h-[190px] w-[290px]"} group relative flex flex-row items-center justify-between rounded-md pt-6 transition`}
                        >
                            <div className="flex h-full flex-col items-center transition outline-none">
                                <div
                                    className={`${pack.length <= 12 ? "h-[150px] w-[150px]" : "h-[120px] w-[120px]"}`}
                                >
                                    <Image
                                        src={`/app-logos/${item.mainstream_app_id}.jpg`}
                                        alt={item.mainstream_app_name}
                                        width={0}
                                        height={0}
                                        sizes="100vw"
                                        className="h-auto w-full rounded-2xl"
                                    />
                                </div>
                                <div
                                    className={`${pack.length <= 12 ? "max-w-[150px] text-[28px]" : "max-w-[120px] text-[25px]"} mt-3 text-center leading-tight tracking-tight text-[#aeaeae]`}
                                >
                                    {item.mainstream_app_name}
                                </div>
                            </div>
                            <div
                                className={
                                    pack.length <= 12 ? "-mt-20" : "-mt-12"
                                }
                            >
                                <ArrowRight
                                    size={pack.length <= 12 ? 42 : 32}
                                    className="text-[#e6e6e6]"
                                />
                            </div>
                            <div className="flex h-full flex-col items-center transition outline-none">
                                <div
                                    className={`${pack.length <= 12 ? "h-[150px] w-[150px]" : "h-[120px] w-[120px]"}`}
                                >
                                    <Image
                                        src={`/app-logos/${item.private_alternative_id}.jpg`}
                                        alt={item.private_alternative_name}
                                        width={0}
                                        height={0}
                                        sizes="100vw"
                                        className="h-auto w-full rounded-2xl"
                                    />
                                </div>
                                <div
                                    className={`${pack.length <= 12 ? "max-w-[150px] text-[28px]" : "max-w-[120px] text-[25px]"} mt-3 text-center leading-tight tracking-tight text-[#aeaeae]`}
                                >
                                    {item.private_alternative_name}
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
