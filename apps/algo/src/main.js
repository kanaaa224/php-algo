const { createApp     } = Vue;
const { createVuetify } = Vuetify

const vuetify = createVuetify({
    theme: {
        defaultTheme: window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
        themes: {
            light: {
                dark: false,
                colors: {
                    background: '#fff',
                    surface:    '#fff',
                    primary:    '#2196f3',
                    secondary:  '#444'
                }
            },
            dark: {
                dark: true,
                colors: {
                    background: '#222',
                    surface:    '#222',
                    primary:    '#2196f3',
                    secondary:  '#eee'
                }
            }
        }
    }
});

const app = createApp({
    data() {
        return {
            snackbar_visible: false,
            snackbar_time: 5000,
            snackbar_color: '',
            snackbar_message: '',

            dialog_1_visible: false,
            dialog_2_visible: false,
            dialog_2_radio: '',

            game: {
                mode: '',
                state: 0,
                cards_size: { x: 0, y: 0 },
                cards: [],
                cards_status: [],
                cards_queue:  []
            }
        }
    },
    methods: {
        logging(d = '') {
            console.log(`[ ${(new Date()).toISOString()} ] ${d}`);
        },

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        async callAPI(requestBody = {}, queries = '', uri = this.API_URI) {
            if(queries) {
                if(/\?/.test(uri)) uri += `&${queries}`;
                else               uri += `?${queries}`;
            }

            const response  = await fetch(uri, { method: 'POST', body: JSON.stringify(requestBody) });
            const data      = await response.json();

            if(!data.status) throw(`api-bad-status`);

            if(data.data.result != 'success') throw(`api-call-result: failed - ${data.data.value}`);

            return data.data.value;
        },

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        async snackbar(message = '', color = '') {
            if(!this.snackbar_visible) {
                this.snackbar_message = message;
                this.snackbar_color   = color;
                this.snackbar_visible = true;
            }
        },

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        async dialog_1() {
            if(!this.dialog_1_visible) {
                this.dialog_1_visible = true;

                return;
            }

            this.dialog_1_viewed  = true;
            this.dialog_1_visible = false;

            this.dialog_2();
        },

        async dialog_2() {
            if(!this.dialog_2_visible) {
                this.dialog_2_visible = true;

                return;
            }

            if(!this.dialog_2_radio) return;

            this.dialog_2_visible = false;

            this.game_start(this.dialog_2_radio);
        },

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        async game_initialize() {
            this.game.mode  = '';
            this.game.state = '';

            this.game.cards        = [];
            this.game.cards_status = [];
            this.game.cards_queue  = [];

            let size_x = this.game.cards_size.x = 5;
            let size_y = this.game.cards_size.y = 8;

            for(let i = 0; i < size_x; i++) {
                this.game.cards[i] = [];

                for(let j = 0; j < size_y; j++) {
                    this.game.cards[i][j] = {
                        num: 0,
                        color: 'white'
                    };
                }
            }

            for(let i = 0; i < size_x; i++) {
                this.game.cards_status[i] = [];

                for(let j = 0; j < size_y; j++) {
                    this.game.cards_status[i][j] = 0;
                }
            }
        },

        async game_start(mode = '') {
            this.game_initialize();

            switch(mode) {
                case 'single': {
                    break;
                }

                case 'multiplayer': {
                    break;
                }

                case 'offline': {
                    let size_x = this.game.cards_size.x;
                    let size_y = this.game.cards_size.y;

                    let max_card_num = (size_x - 2) * size_y;

                    const numbers = Array.from({ length: max_card_num }, (_, i) => i + 1);

                    // Fisher–Yates シャッフル
                    for(let i = numbers.length - 1; i > 0; i--) {
                        const j = Math.floor(Math.random() * (i + 1));

                        [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
                    }

                    this.game.cards_queue = numbers;

                    for(let j = 0; j < size_y; j++) {
                        this.game.cards_status[Math.floor(size_x / 2)][j] = this.game.cards_queue.shift();
                    }

                    break;
                }

                default: {
                    return;
                }
            }

            this.game.mode = mode;

            this.cards_update();
        },

        async cards_update() {
            switch(this.game.mode) {
                case 'single':
                case 'multiplayer':
                case 'offline': {
                    break;
                }

                default: {
                    return;
                }
            }

            for(let i = 0; i < this.game.cards.length; i++) {
                for(let j = 0; j < this.game.cards[i].length; j++) {
                    let num = this.game.cards_status[i][j];

                    this.game.cards[i][j] = {
                        num: Math.ceil(num / 2),
                        color: (num % 2 === 0) ? 'black' : 'white'
                    };
                }
            }
        },

        async cards_check() {
            switch(this.game.mode) {
                case 'single': {
                    break;
                }

                case 'multiplayer': {
                    break;
                }

                case 'offline': {
                    break;
                }

                default: {
                    return;
                }
            }
        },

        async placing_card(x = 0, y = 0) {
            switch(this.game.mode) {
                case 'single': {
                    break;
                }

                case 'multiplayer': {
                    break;
                }

                case 'offline': {
                    let size_x = this.game.cards_size.x;
                    let size_y = this.game.cards_size.y;
                    let center = Math.floor(size_x / 2);

                    if(center == x) {
                        this.snackbar('ここには置けません', 'error');

                        return;
                    }

                    let num = 0;

                    for(let i = 0; i < this.game.cards.length; i++) {
                        num += this.game.cards_status[i][y] != 0 ? 1 : 0;
                    }

                    if(num >= Math.ceil(size_x / 2)) {
                        this.snackbar('もう置けません', 'error');

                        return;
                    }

                    if(center > x) {
                        for(let i = center; i > x; i--) {
                            if(this.game.cards_status[i][y] == 0) {
                                this.snackbar('間にカードがありません', 'error');

                                return;
                            }
                        }

                        if(this.game.cards_status[x][y] != 0) {
                            this.game.cards_status[x - 1][y] = this.game.cards_status[x][y];
                        }
                    }

                    if(center < x) {
                        for(let i = center; i < x; i++) {
                            if(this.game.cards_status[i][y] == 0) {
                                this.snackbar('間にカードがありません', 'error');

                                return;
                            }
                        }

                        if(this.game.cards_status[x][y] != 0) {
                            this.game.cards_status[x + 1][y] = this.game.cards_status[x][y];
                        }
                    }

                    this.game.cards_status[x][y] = this.game.cards_queue.shift();

                    this.cards_update();
                    this.cards_check();

                    break;
                }

                default: {
                    return;
                }
            }
        },

        async initialize() {
            this.dialog_1();

            this.logging(`initialized`);
        },

        ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        async onLoad() {
            await this.initialize();
        }
    },
    mounted() {
        const theme = Vuetify.useTheme();

        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
            theme.global.name.value = e.matches ? 'dark' : 'light';
        });

        window.addEventListener('load', this.onLoad);
    }
});

app.use(vuetify).mount('#app');