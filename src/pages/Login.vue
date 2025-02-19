<template>
    <section class="bg-white">
        <div class="lg:grid lg:min-h-screen lg:grid-cols-12">
            <main
                class="flex items-center justify-center px-8 py-8 sm:px-12 lg:col-span-7 lg:px-16 lg:py-12 xl:col-span-6"
            >
                <div class="max-w-xl lg:max-w-3xl">
                    <div class="hidden lg:relative lg:block">
                        <div
                            class="mt-6 text-xl font-bold sm:text-2xl md:text-3xl"
                        >
                            <div class="block text-dusty-600">Login</div>
                        </div>
                    </div>
                    <div class="relative -mt-16 block lg:hidden">
                        <div
                            class="inline-flex h-20 w-20 items-center justify-center rounded-full bg-white sm:h-24 sm:w-24"
                        >
                            <span class="sr-only">Home</span>
                            <img class="h-18 sm:h-20" src="/assets/cover.jpg" />
                        </div>

                        <div
                            class="mt-6 text-xl font-bold sm:text-2xl md:text-3xl"
                        >
                            <div class="block text-dusty-600">Login</div>
                        </div>
                    </div>

                    <div
                        class="inline-flex items-center justify-center rounded bg-red-100 px-4 py-2 my-2 text-red-700"
                        v-if="error"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke-width="1.5"
                            stroke="currentColor"
                            class="-ms-1 me-1.5 h-4 w-4"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                            />
                        </svg>

                        <div class="whitespace-nowrap text-sm">
                            {{ error }}
                        </div>
                    </div>
                    <div
                        class="inline-flex items-center justify-center rounded bg-dusty-100 px-4 py-2 my-2 text-dusty-700"
                        v-if="message"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            class="-ms-1 me-1.5 h-4 w-4"
                        >
                            <path
                                d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
                            ></path>
                        </svg>

                        <div class="whitespace-nowrap text-sm">
                            {{ message }}
                        </div>
                    </div>

                    <form method="post" class="mt-6 grid grid-cols-6 gap-6">
                        <div class="col-span-6">
                            <label
                                for="Username"
                                class="block overflow-hidden rounded-md border border-solid border-dusty-200 px-3 py-2 shadow-sm focus-within:border-dusty-600 focus-within:ring-1 focus-within:ring-dusty-600"
                            >
                                <span
                                    class="text-xs font-medium text-dusty-700"
                                >
                                    Username
                                </span>

                                <input
                                    type="text"
                                    id="Username"
                                    name="username"
                                    placeholder="example@dddust.com"
                                    class="mt-1 w-full border-none p-0 focus:border-transparent focus:outline-none focus:ring-0 sm:text-sm"
                                    required
                                />
                            </label>
                        </div>

                        <div class="col-span-6">
                            <label
                                for="Password"
                                class="block overflow-hidden rounded-md border border-solid border-dusty-200 px-3 py-2 shadow-sm focus-within:border-dusty-600 focus-within:ring-1 focus-within:ring-dusty-600"
                            >
                                <span
                                    class="text-xs font-medium text-dusty-700"
                                >
                                    Password
                                </span>

                                <input
                                    type="password"
                                    id="Password"
                                    name="password"
                                    placeholder="******"
                                    class="mt-1 w-full border-none p-0 focus:border-transparent focus:outline-none focus:ring-0 sm:text-sm"
                                    required
                                />
                            </label>
                        </div>

                        <div
                            class="col-span-6 sm:flex sm:items-center sm:gap-4"
                        >
                            <button
                                type="submit"
                                class="block cursor-pointer w-full rounded bg-dusty-600 px-12 py-3 text-sm font-medium text-white shadow transition-200 hover:bg-dusty-500 focus:outline-none focus:ring active:bg-dusty-700 sm:w-auto no-underline border-none focus:outline-none"
                            >
                                Login
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    </section>
</template>

<script setup>
import { useRoute } from "vue-router";

const route = useRoute();
const error = route.query.error;
const message = route.query.message;
</script>
