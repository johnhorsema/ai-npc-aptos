<template>
    <div id="lab-groupchat" class="bg-light min-h-[calc(100vh-4rem)]">
        <div
            class="mx-auto max-w-screen-xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8 bg-light border-b border-b-solid border-gray-200"
        >
            <div class="mb-3">Available Agents</div>

            <div
                class="p-3 pt-6 mb-3 rounded border border-solid border-gray-200 bg-white"
            >
                <div class="grid grid-cols-4 gap-4">
                    <div v-for="member in members">
                        <div class="flex flex-col items-center gap-2">
                            <img
                                alt=""
                                :src="getAvatar(member)"
                                class="size-[15rem] rounded-full object-cover"
                            />

                            <div
                                class="text-sm font-medium text-gray-900 text-center break-words"
                            >
                                <div>{{ member.name }}</div>
                                <div v-if="member.role">
                                    ({{ member.role }})
                                </div>
                                <div
                                    class="text-xs text-gray-700"
                                    v-if="member.description"
                                >
                                    {{ member.description }}
                                </div>
                                <div
                                    class="text-xs text-gray-700"
                                    v-if="member.instruction"
                                >
                                    {{ member.instruction }}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div>
                        <div
                            class="flex flex-col items-center gap-2 cursor-pointer"
                            @click="addAgent"
                            v-if="members.length < 10"
                        >
                            <div class="i-bi:plus size-14"></div>
                            <div class="text-sm font-medium text-gray-900">
                                Add Agent
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="mb-3">
                <div
                    class="p-3 mb-3 rounded border border-solid border-gray-200 bg-white text-xs text-gray-700"
                    v-for="(r, i) in responses"
                    :key="i"
                >
                    <div class="flex">
                        <img
                            alt=""
                            :src="getAvatar(members[i])"
                            class="size-14 rounded-full object-cover"
                        />
                        <div>
                            {{ r }}
                        </div>
                    </div>
                </div>
            </div>
            <div
                class="p-3 mb-3 rounded border border-solid border-gray-200 bg-white"
            >
                <div class="flex w-full">
                    <input
                        type="text"
                        id="message"
                        placeholder="Type your mind"
                        class="w-[calc(100%-2rem)] border-0 py-2 px-3 ring-1 ring-inset ring-gray-400 rounded-l placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-gray-600 sm:text-sm sm:leading-6 outline-none"
                        v-model="message"
                    />
                    <div
                        class="cursor-pointer leading-6 decoration-none rounded-r bg-dusty-800 hover:bg-dusty-900 px-6 py-1 text-sm font-medium text-white border-none focus:outline-none flex justify-center items-center"
                        @click="startChat"
                    >
                        <div class="i-bi:send text-sm mr-2"></div>
                        Send
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from "vue";
import { format, formatDistanceToNow } from "date-fns";
import api from "../api";

const responses = ref([]);

const slug = (str) =>
    str
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^\w\-]+/g, "")
        .replace(/\-\-+/g, "-")
        .trim("-");

const members = ref([]);

const randomName = () => {
    const names = [
        {
            role: "Priest",
            gender: "F",
            race: "Elf",
            image: "Elf_F_single.png",
        },
        {
            role: "Priest",
            gender: "F",
            race: "Dragonborn",
            image: "Dragonborn_F_single.png",
        },
        {
            role: "Priest",
            gender: "M",
            race: "Dragonborn",
            image: "Dragonborn_M_single.png",
        },
        {
            role: "Priest",
            gender: "F",
            race: "Dwarf",
            image: "Dwarf_F_single.png",
        },
        {
            role: "Priest",
            gender: "M",
            race: "Dwarf",
            image: "Dwarf_M_single.png",
        },
        {
            role: "Priest",
            gender: "M",
            race: "Elf",
            image: "Elf_M_single.png",
        },
        {
            role: "Priest",
            gender: "F",
            race: "Gnome",
            image: "Gnome_F_single.png",
        },
        {
            role: "Priest",
            gender: "M",
            race: "Gnome",
            image: "Gnome_M_single.png",
        },
        {
            role: "Priest",
            gender: "F",
            race: "Half-Elf",
            image: "Half-Elf_F_single.png",
        },
        {
            role: "Priest",
            gender: "M",
            race: "Half-Elf",
            image: "Half-Elf_M_single.png",
        },
        {
            role: "Priest",
            gender: "F",
            race: "Half-Orc",
            image: "Half-Orc_F_single.png",
        },
        {
            role: "Priest",
            gender: "M",
            race: "Half-Orc",
            image: "Half-Orc_M_single.png",
        },
        {
            role: "Priest",
            gender: "F",
            race: "Halfling",
            image: "Halfling_F_single.png",
        },
        {
            role: "Priest",
            gender: "M",
            race: "Halfling",
            image: "Halfling_M_single.png",
        },
        {
            role: "Priest",
            gender: "F",
            race: "Human",
            image: "Human_F_single.png",
        },
        {
            role: "Priest",
            gender: "M",
            race: "Human",
            image: "Human_M_single.png",
        },
        {
            role: "Priest",
            gender: "F",
            race: "Tiefling",
            image: "Tiefling_F_single.png",
        },
        {
            role: "Priest",
            gender: "M",
            race: "Tiefling",
            image: "Tiefling_M_single.png",
        },
        {
            role: "Rogue",
            gender: "F",
            race: "Dwarf",
            image: "Dwarf_F_single.png",
        },
        {
            role: "Rogue",
            gender: "F",
            race: "Dragonborn",
            image: "Dragonborn_F_single.png",
        },
        {
            role: "Rogue",
            gender: "M",
            race: "Dragonborn",
            image: "Dragonborn_M_single.png",
        },
        {
            role: "Rogue",
            gender: "M",
            race: "Dwarf",
            image: "Dwarf_M_single.png",
        },
        {
            role: "Rogue",
            gender: "F",
            race: "Elf",
            image: "Elf_F_single.png",
        },
        {
            role: "Rogue",
            gender: "M",
            race: "Elf",
            image: "Elf_M_single.png",
        },
        {
            role: "Rogue",
            gender: "F",
            race: "Gnome",
            image: "Gnome_F_single.png",
        },
        {
            role: "Rogue",
            gender: "M",
            race: "Gnome",
            image: "Gnome_M_single.png",
        },
        {
            role: "Rogue",
            gender: "F",
            race: "Half-Elf",
            image: "Half-Elf_F_single.png",
        },
        {
            role: "Rogue",
            gender: "M",
            race: "Half-Elf",
            image: "Half-Elf_M_single.png",
        },
        {
            role: "Rogue",
            gender: "F",
            race: "Half-Orc",
            image: "Half-Orc_F_single.png",
        },
        {
            role: "Rogue",
            gender: "M",
            race: "Half-Orc",
            image: "Half-Orc_M_single.png",
        },
        {
            role: "Rogue",
            gender: "F",
            race: "Halfling",
            image: "Halfling_F_single.png",
        },
        {
            role: "Rogue",
            gender: "M",
            race: "Halfling",
            image: "Halfling_M_single.png",
        },
        {
            role: "Rogue",
            gender: "F",
            race: "Human",
            image: "Human_F_single.png",
        },
        {
            role: "Rogue",
            gender: "M",
            race: "Human",
            image: "Human_M_single.png",
        },
        {
            role: "Rogue",
            gender: "F",
            race: "Tiefling",
            image: "Tiefling_F_single.png",
        },
        {
            role: "Rogue",
            gender: "M",
            race: "Tiefling",
            image: "Tiefling_M_single.png",
        },
        {
            role: "Warrior",
            gender: "F",
            race: "Dragonborn",
            image: "Dragonborn_F_single.png",
        },
        {
            role: "Warrior",
            gender: "M",
            race: "Dragonborn",
            image: "Dragonborn_M_single.png",
        },
        {
            role: "Warrior",
            gender: "F",
            race: "Dwarf",
            image: "Dwarf_F_single.png",
        },
        {
            role: "Warrior",
            gender: "M",
            race: "Dwarf",
            image: "Dwarf_M_single.png",
        },
        {
            role: "Warrior",
            gender: "F",
            race: "Elf",
            image: "Elf_F_single.png",
        },
        {
            role: "Warrior",
            gender: "M",
            race: "Elf",
            image: "Elf_M_single.png",
        },
        {
            role: "Warrior",
            gender: "F",
            race: "Gnome",
            image: "Gnome_F_single.png",
        },
        {
            role: "Warrior",
            gender: "M",
            race: "Gnome",
            image: "Gnome_M_single.png",
        },
        {
            role: "Warrior",
            gender: "F",
            race: "Half-Elf",
            image: "Half-Elf_F_single.png",
        },
        {
            role: "Warrior",
            gender: "M",
            race: "Half-Elf",
            image: "Half-Elf_M_single.png",
        },
        {
            role: "Warrior",
            gender: "F",
            race: "Half-Orc",
            image: "Half-Orc_F_single.png",
        },
        {
            role: "Warrior",
            gender: "M",
            race: "Half-Orc",
            image: "Half-Orc_M_single.png",
        },
        {
            role: "Warrior",
            gender: "F",
            race: "Halfling",
            image: "Halfling_F_single.png",
        },
        {
            role: "Warrior",
            gender: "M",
            race: "Halfling",
            image: "Halfling_M_single.png",
        },
        {
            role: "Warrior",
            gender: "F",
            race: "Human",
            image: "Human_F_single.png",
        },
        {
            role: "Warrior",
            gender: "M",
            race: "Human",
            image: "Human_M_single.png",
        },
        {
            role: "Warrior",
            gender: "F",
            race: "Tiefling",
            image: "Tiefling_F_single.png",
        },
        {
            role: "Warrior",
            gender: "M",
            race: "Tiefling",
            image: "Tiefling_M_single.png",
        },
        {
            role: "Wizard",
            gender: "M",
            race: "Half-Orc",
            image: "Half-Orc_M_single.png",
        },
        {
            role: "Wizard",
            gender: "F",
            race: "Dragonborn",
            image: "Dragonborn_F_single.png",
        },
        {
            role: "Wizard",
            gender: "M",
            race: "Dragonborn",
            image: "Dragonborn_M_single.png",
        },
        {
            role: "Wizard",
            gender: "F",
            race: "Dwarf",
            image: "Dwarf_F_single.png",
        },
        {
            role: "Wizard",
            gender: "M",
            race: "Dwarf",
            image: "Dwarf_M_single.png",
        },
        {
            role: "Wizard",
            gender: "F",
            race: "Elf",
            image: "Elf_F_single.png",
        },
        {
            role: "Wizard",
            gender: "M",
            race: "Elf",
            image: "Elf_M_single.png",
        },
        {
            role: "Wizard",
            gender: "F",
            race: "Gnome",
            image: "Gnome_F_single.png",
        },
        {
            role: "Wizard",
            gender: "M",
            race: "Gnome",
            image: "Gnome_M_single.png",
        },
        {
            role: "Wizard",
            gender: "F",
            race: "Half-Elf",
            image: "Half-Elf_F_single.png",
        },
        {
            role: "Wizard",
            gender: "M",
            race: "Half-Elf",
            image: "Half-Elf_M_single.png",
        },
        {
            role: "Wizard",
            gender: "F",
            race: "Half-Orc",
            image: "Half-Orc_F_single.png",
        },
        {
            role: "Wizard",
            gender: "F",
            race: "Halfling",
            image: "Halfling_F_single.png",
        },
        {
            role: "Wizard",
            gender: "M",
            race: "Halfling",
            image: "Halfling_M_single.png",
        },
        {
            role: "Wizard",
            gender: "F",
            race: "Human",
            image: "Human_F_single.png",
        },
        {
            role: "Wizard",
            gender: "M",
            race: "Human",
            image: "Human_M_single.png",
        },
        {
            role: "Wizard",
            gender: "F",
            race: "Tiefling",
            image: "Tiefling_F_single.png",
        },
        {
            role: "Wizard",
            gender: "M",
            race: "Tiefling",
            image: "Tiefling_M_single.png",
        },
    ].filter((n) => {
        return members.value.map((m) => m.name).indexOf(n) == -1;
    });
    return names[Math.floor(Math.random() * names.length)];
};

const addAgent = () => {
    let d = randomName();
    let name = d.name ? d.name : `${d.role}_${d.race}_${d.gender}`;
    api.lab.groupchat
        .completion({
            query: params.query,
            log: params.messages,
            instruction: `
              Generate responses of the below agents, separated by "||".\n
              ${members.value
                  .map((m) => m.id + ": " + m.instruction)
                  .join("\n")}
            `,
        })
        .then((r) => {
            members.value.push({
                name: name,
                id: slug(name),
                description: d.description,
                role: d.role,
                image: d.image,
                instruction: r.content,
            });
        })
        .catch((e) => {
            console.error(e);
        });
};

const getAvatar = (m) => {
    return m.avatar
        ? m.avatar
        : `/assets/characters/${m.role.toLowerCase()}/${m.image}`;
};

const message = ref("");
const threads = ref([]);

const addResponse = () => {
    let m = {
        role: "system",
        content: message.value,
        created: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"),
    };
    threads.value.push(m);
};

const startChat = () => {
    let m = {
        role: "user",
        content: message.value,
        created: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"),
    };
    threads.value.push(m);
    message.value = "";
    let params = {
        messages: threads.value.map((t) => {
            if (t.role === "system") {
                return {
                    role: "assistant",
                    content: t.content,
                };
            }
            return {
                role: t.role,
                content: t.content,
            };
        }),
        query: m.content,
    };

    api.lab.groupchat
        .completion({
            query: params.query,
            log: params.messages,
            instruction: `
              Generate responses of the below agents, separated by "||".\n
              ${members.value
                  .map((m) => m.id + ": " + m.instruction)
                  .join("\n")}
            `,
        })
        .then((r) => {
            responses.value = r.content.split("||").filter((m) => m);
            console.log(r.content.split("||"));
            // addResponse(r.system);
        })
        .catch((e) => {
            console.error(e);
        });
};
</script>
