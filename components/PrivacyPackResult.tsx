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
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gridAutoRows: "270px",
                    columnGap: "110px",
                    rowGap: "56px",
                    justifyItems: "center",
                }}
            >
                {pack.map((item) => {
                    return (
                        <div
                            key={item.category}
                            className="group relative flex h-[270px] w-[380px] flex-row items-center justify-between rounded-md pt-6 transition"
                        >
                            <div className="flex h-full flex-col items-center transition outline-none">
                                <div className="h-[150px] w-[150px]">
                                    <Image
                                        src={`/app-logos/${item.mainstream_app_id}.jpg`}
                                        alt={item.mainstream_app_name}
                                        width={0}
                                        height={0}
                                        sizes="100vw"
                                        className="h-full w-full rounded-2xl object-cover"
                                    />
                                </div>
                                <div className="mt-3 max-w-[150px] text-center text-[28px] leading-tight tracking-tight text-[#aeaeae]">
                                    {item.mainstream_app_name}
                                </div>
                            </div>
                            <div className="-mt-20">
                                <ArrowRight
                                    size={42}
                                    className="text-[#e6e6e6]"
                                />
                            </div>
                            <div className="flex h-full flex-col items-center transition outline-none">
                                <div className="h-[150px] w-[150px]">
                                    <Image
                                        src={`/app-logos/${item.private_alternative_id}.jpg`}
                                        alt={item.private_alternative_name}
                                        width={0}
                                        height={0}
                                        sizes="100vw"
                                        className="h-full w-full rounded-2xl object-cover"
                                    />
                                </div>
                                <div className="mt-3 max-w-[150px] text-center text-[28px] leading-tight tracking-tight text-[#aeaeae]">
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
