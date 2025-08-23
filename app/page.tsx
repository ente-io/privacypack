"use client";

import Image from "next/image";
import Link from "next/link";
import React from "react";

export default function Home() {
    return (
        <div className="flex h-auto w-full flex-col items-center justify-normal py-16 lg:py-32 xl:py-16 2xl:py-20">
            <div className="flex flex-col items-center">
                <div className="flex flex-col items-center">
                    <div className="h-[50px] w-[90px] md:h-[90px] md:w-[135px]">
                        <Image
                            src="/logo.png"
                            alt="Privacy Pack logo"
                            width={0}
                            height={0}
                            sizes="100vw"
                            className="h-auto w-full"
                            priority
                        />
                    </div>
                    <h1 className="green-text xs:text-6xl mt-6 ml-2 pr-2 text-5xl font-bold tracking-[-0.09em] md:mt-4 md:text-8xl">
                        PrivacyPack
                    </h1>
                    <p className="xs:text-lg mt-4 flex flex-col text-center text-base font-semibold tracking-tighter text-white/50 md:text-2xl">
                        YOUR PRIVACY WINS, IN ONE CARD
                    </p>
                    <Link
                        href="/create"
                        id="create-pack"
                        className="mt-12 items-center justify-center rounded-2xl bg-white px-10 py-4 text-base font-semibold text-black transition-all duration-150 hover:bg-white/80"
                    >
                        CREATE YOUR PACK
                    </Link>
                </div>
            </div>
            <div className="my-20 flex flex-col items-center gap-2">
                <span className="text-xs text-[#aeaeae]">A toy by</span>
                <div className="w-16">
                    <a href="https://ente.io" target="_blank">
                        <Image
                            src="/ente.svg"
                            alt="Ente logo"
                            width={0}
                            height={0}
                            sizes="100vw"
                            className="h-auto w-full"
                            priority
                        />
                    </a>
                </div>
            </div>
            <div className="flex w-[80%] flex-col items-center gap-3 md:w-[640px] xl:w-[740px]">
                <div className="w-full">
                    <Image
                        src="/hero.png"
                        alt="Hero illustration"
                        width={0}
                        height={0}
                        sizes="100vw"
                        className="h-auto w-full"
                        priority
                        quality={100}
                    />
                </div>
            </div>
            <div className="mt-24 flex flex-row gap-5 text-sm">
                <Link
                    href="/privacy"
                    className="text-[#717171] underline underline-offset-4 hover:text-[#8e8e8e]"
                >
                    Privacy
                </Link>
                <Link
                    href="/terms"
                    className="text-[#717171] underline underline-offset-4 hover:text-[#8e8e8e]"
                >
                    Terms
                </Link>
            </div>
        </div>
    );
}
