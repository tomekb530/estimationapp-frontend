<template>
    <v-dialog v-model="model" max-width="500px">
        <v-card>
            <v-card-title>Szczegóły dla: Test</v-card-title>
            <v-card-text>
                <div v-for="header in props.headers" :key="header.key">
                    <v-row v-if="props.data[header.key] && header.key !== 'logo'">
                        <v-col cols="12">
                            <v-card>
                                <v-card-title>{{ header.title }}</v-card-title>
                                <v-card-text>
                                    {{ (header.value && header.key !== "description" ) ? header.value(props.data) : props.data[header.key] }}
                                </v-card-text>
                            </v-card>
                        </v-col>
                    </v-row>
                </div>
            </v-card-text>
            <v-card-actions>
            <v-spacer></v-spacer>

            <v-btn
              color="surface-variant"
              text="Zamknij"
              variant="flat"
              @click="model = false"
            ></v-btn>
          </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script setup lang="ts">
const model = defineModel<boolean>();
const props = defineProps<{
    headers: any[],
    data: object | null,
}>();
</script>