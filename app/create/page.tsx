"use client";

import Link from "next/link";
import {
    ArrowRight,
    Download,
    Share2,
    ChevronDown,
    Loader2,
} from "lucide-react";
import React, { useState, useRef } from "react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import data from "../../data/apps.json";
import PrivacyPackResult from "@/components/PrivacyPackResult";
import { handleDownload, handleShare } from "@/lib/utils";
import Image from "next/image";

export default function App() {
    const [pack, setPack] = useState(() => {
        const initialPack = data.categories.map((category) => ({
            category: category.name,
            order: category.order,
            mainstream_app_id: category.mainstream_apps[0].id,
            mainstream_app_name: category.mainstream_apps[0].name,
            private_alternative_id: "",
            private_alternative_name: "",
        }));
        return initialPack;
    });

    // track which dropdown is open
    const [openKey, setOpenKey] = useState<string | null>(null);
    const touchKeyRef = useRef<string | null>(null);

    const getTouchTriggerHandlers = (key: string) => ({
        onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => {
            if (e.pointerType === "touch") {
                // prevent Radix from opening immediately on pointerdown
                e.preventDefault();
                touchKeyRef.current = key;
            }
        },
        onClick: () => {
            // only toggle if this was a true tap
            if (touchKeyRef.current === key) {
                setOpenKey((prev) => (prev === key ? null : key));
            }
            touchKeyRef.current = null;
        },
    });

    const [isDownloading, setIsDownloading] = useState(false);
    const [isSharing, setIsSharing] = useState(false);

    const processSelection = async (action: () => Promise<void> | void) => {
        const actionPromise = Promise.resolve(action());

        return actionPromise;
    };

    const handleSelectApp = (
        categoryName: string,
        app: { id: string; name: string },
        type: "mainstream" | "private",
    ) => {
        setPack((prev) =>
            prev.map((item) =>
                item.category === categoryName
                    ? type === "mainstream"
                        ? {
                              ...item,
                              mainstream_app_id: app.id,
                              mainstream_app_name: app.name,
                          }
                        : {
                              ...item,
                              private_alternative_id: app.id,
                              private_alternative_name: app.name,
                          }
                    : item,
            ),
        );
    };

    return (
        <>
            <div className="flex w-full flex-col p-4">
                <div className="flex w-full flex-row items-center justify-between md:px-4 md:pt-4">
                    <Link
                        href="/"
                        className="green-text pr-1 text-2xl font-bold tracking-[-0.09em]"
                    >
                        PrivacyPack
                    </Link>
                    <div className="flex flex-row items-center gap-8">
                        <a
                            href="https://github.com/ente-io/privacypack?tab=readme-ov-file#add-a-missing-app"
                            target="_blank"
                            className="text-sm text-[#868686] underline decoration-[#525252] underline-offset-4 hover:text-white hover:decoration-white"
                        >
                            Add a missing app
                        </a>
                        <button
                            onClick={async () => {
                                setIsDownloading(true);
                                try {
                                    await processSelection(handleDownload);
                                } finally {
                                    setIsDownloading(false);
                                }
                            }}
                            id="download-navbar"
                            className="hidden h-11 cursor-pointer items-center justify-center gap-2 rounded-lg bg-white px-5 text-black transition-all duration-150 hover:bg-white/80 active:bg-white/80 sm:flex"
                        >
                            {isDownloading ? (
                                <Loader2
                                    color="black"
                                    size={18}
                                    className="animate-spin"
                                />
                            ) : (
                                <Download color="black" size={18} />
                            )}
                            <span>
                                {isDownloading ? "DOWNLOADING..." : "DOWNLOAD"}
                            </span>
                        </button>
                    </div>
                </div>

                <div className="mt-16 mb-10 grid grid-cols-1 gap-14 sm:mx-auto md:grid-cols-2 md:grid-rows-6 md:gap-20 lg:my-24 lg:gap-28 xl:my-24 xl:grid-cols-3 xl:grid-rows-4 xl:gap-20 2xl:my-32 2xl:gap-40">
                    {pack.map((item) => {
                        const category = data.categories.find(
                            (c) => c.name === item.category,
                        );

                        const mainKey = `${item.category}-main`;
                        const altKey = `${item.category}-alt`;

                        return (
                            <div
                                key={item.category}
                                className="flex flex-col gap-2"
                            >
                                <div className="mb-1 text-[#aeaeae]">
                                    {item.category}
                                </div>
                                <div className="xs:p-8 flex h-full w-full flex-row items-center justify-between rounded-3xl bg-[#fff]/2 p-3 sm:w-auto sm:justify-normal sm:gap-3 md:rounded-4xl">
                                    <DropdownMenu
                                        open={openKey === mainKey}
                                        onOpenChange={(next) =>
                                            setOpenKey(next ? mainKey : null)
                                        }
                                    >
                                        <DropdownMenuTrigger asChild>
                                            <div
                                                {...getTouchTriggerHandlers(
                                                    mainKey,
                                                )}
                                                className="flex h-full cursor-pointer touch-pan-y flex-col items-center rounded-2xl bg-[#2B2B2B] p-4 text-[#aeaeae] transition outline-none hover:bg-[#ededed] hover:text-black focus:bg-[#ededed] focus:text-black data-[state=open]:bg-[#ededed] data-[state=open]:text-black md:rounded-3xl"
                                            >
                                                <div className="h-18 w-18 lg:h-24 lg:w-24 xl:h-28 xl:w-28 2xl:h-40 2xl:w-40">
                                                    <Image
                                                        src={`/app-logos/${item.mainstream_app_id}.jpg`}
                                                        alt={
                                                            item.mainstream_app_name
                                                        }
                                                        width={0}
                                                        height={0}
                                                        sizes="100vw"
                                                        className="h-auto w-full rounded-xl md:rounded-2xl"
                                                    />
                                                </div>
                                                <div className="mt-5 max-w-18 text-center text-xs leading-tight font-medium tracking-tight lg:max-w-24 lg:text-base xl:max-w-28 2xl:max-w-40">
                                                    {item.mainstream_app_name}
                                                </div>
                                                <ChevronDown className="mt-1 h-4 w-4" />
                                            </div>
                                        </DropdownMenuTrigger>

                                        <DropdownMenuContent
                                            align="start"
                                            side="bottom"
                                            className="rounded-2xl"
                                        >
                                            {category?.mainstream_apps.map(
                                                (mainstream_app) => (
                                                    <DropdownMenuItem
                                                        key={
                                                            mainstream_app.name
                                                        }
                                                        onClick={() =>
                                                            handleSelectApp(
                                                                item.category,
                                                                mainstream_app,
                                                                "mainstream",
                                                            )
                                                        }
                                                        className="flex cursor-pointer flex-row items-center gap-2 rounded-lg"
                                                    >
                                                        <div className="h-5 w-5">
                                                            <Image
                                                                src={`/app-logos/${mainstream_app.id}.jpg`}
                                                                alt={
                                                                    mainstream_app.name
                                                                }
                                                                width={0}
                                                                height={0}
                                                                sizes="100vw"
                                                                className="h-auto w-full"
                                                            />
                                                        </div>
                                                        <span className="text-xs sm:text-sm">
                                                            {
                                                                mainstream_app.name
                                                            }
                                                        </span>
                                                    </DropdownMenuItem>
                                                ),
                                            )}
                                        </DropdownMenuContent>
                                    </DropdownMenu>

                                    <ArrowRight className="text-[#aeaeae] transition" />

                                    <DropdownMenu
                                        open={openKey === altKey}
                                        onOpenChange={(next) =>
                                            setOpenKey(next ? altKey : null)
                                        }
                                    >
                                        <DropdownMenuTrigger asChild>
                                            <div
                                                {...getTouchTriggerHandlers(
                                                    altKey,
                                                )}
                                                className="flex h-full cursor-pointer touch-pan-y flex-col items-center rounded-2xl bg-[#2B2B2B] p-4 text-[#aeaeae] transition outline-none hover:bg-[#ededed] hover:text-black focus:bg-[#ededed] focus:text-black data-[state=open]:bg-[#ededed] data-[state=open]:text-black md:rounded-3xl"
                                            >
                                                <div
                                                    className={`h-18 w-18 rounded-xl md:rounded-2xl lg:h-24 lg:w-24 xl:h-28 xl:w-28 2xl:h-40 2xl:w-40 ${
                                                        !item.private_alternative_id &&
                                                        "bg-[#383838]"
                                                    }`}
                                                >
                                                    {item.private_alternative_id && (
                                                        <Image
                                                            src={`/app-logos/${item.private_alternative_id}.jpg`}
                                                            alt={
                                                                item.private_alternative_name
                                                            }
                                                            width={0}
                                                            height={0}
                                                            sizes="100vw"
                                                            className="h-auto w-full rounded-xl md:rounded-2xl"
                                                        />
                                                    )}
                                                </div>
                                                <div className="mt-5 max-w-18 text-center text-xs leading-tight font-medium tracking-tight lg:max-w-24 lg:text-base xl:max-w-28 2xl:max-w-40">
                                                    {item.private_alternative_name ||
                                                        "[Pick]"}
                                                </div>
                                                <ChevronDown className="mt-1 h-4 w-4" />
                                            </div>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent
                                            align="end"
                                            side="bottom"
                                            className="rounded-2xl"
                                        >
                                            {category?.private_alternatives.map(
                                                (private_alternative) => (
                                                    <DropdownMenuItem
                                                        key={
                                                            private_alternative.id
                                                        }
                                                        onClick={() =>
                                                            handleSelectApp(
                                                                item.category,
                                                                private_alternative,
                                                                "private",
                                                            )
                                                        }
                                                        className="cursor-pointer rounded-lg"
                                                    >
                                                        <div className="flex flex-row items-center gap-2">
                                                            <div className="h-5 w-5">
                                                                <Image
                                                                    src={`/app-logos/${private_alternative.id}.jpg`}
                                                                    alt={
                                                                        private_alternative.name
                                                                    }
                                                                    width={0}
                                                                    height={0}
                                                                    sizes="100vw"
                                                                    className="h-auto w-full"
                                                                />
                                                            </div>
                                                            <span className="text-xs sm:text-sm">
                                                                {
                                                                    private_alternative.name
                                                                }
                                                            </span>
                                                        </div>
                                                    </DropdownMenuItem>
                                                ),
                                            )}
                                            <DropdownMenuItem
                                                onClick={() => {
                                                    handleSelectApp(
                                                        item.category,
                                                        {
                                                            id: "",
                                                            name: "",
                                                        },
                                                        "private",
                                                    );
                                                }}
                                                className="cursor-pointer rounded-lg"
                                            >
                                                <div className="flex flex-row items-center gap-2">
                                                    {item.private_alternative_id ? (
                                                        <>
                                                            <div className="h-5 w-5 pl-1 text-red-500">
                                                                —
                                                            </div>
                                                            <span className="text-xs text-red-500 transition duration-500 sm:text-sm">
                                                                Remove
                                                            </span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <div className="h-5 w-5 pl-1 text-[#aeaeae]">
                                                                —
                                                            </div>
                                                            <span className="text-xs text-[#aeaeae] transition duration-500 sm:text-sm">
                                                                Remove
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <button
                    onClick={async () => {
                        setIsSharing(true);
                        try {
                            await processSelection(handleShare);
                        } finally {
                            setIsSharing(false);
                        }
                    }}
                    id="share-mobile"
                    className="mt-8 flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-white text-black transition-all duration-150 active:bg-white/80 sm:hidden"
                >
                    {isSharing ? (
                        <Loader2
                            color="black"
                            size={16}
                            className="animate-spin"
                        />
                    ) : (
                        <Share2 color="black" size={16} />
                    )}
                    <span className="text-lg">
                        {isSharing ? "EXPORTING..." : "SHARE"}
                    </span>
                </button>
                <button
                    onClick={async () => {
                        setIsDownloading(true);
                        try {
                            await processSelection(handleDownload);
                        } finally {
                            setIsDownloading(false);
                        }
                    }}
                    id="download-mobile"
                    className="mt-3 mb-8 flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#525252] text-white transition-all duration-150 active:bg-[#444444] sm:hidden"
                >
                    {isDownloading ? (
                        <Loader2
                            color="white"
                            size={16}
                            className="animate-spin"
                        />
                    ) : (
                        <Download color="white" size={16} />
                    )}
                    <span className="text-lg">
                        {isDownloading ? "DOWNLOADING..." : "DOWNLOAD"}
                    </span>
                </button>
            </div>

            <PrivacyPackResult
                pack={pack.filter((item) => item.private_alternative_id)}
            />
        </>
    );
}
