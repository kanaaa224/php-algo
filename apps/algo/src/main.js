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
        return {}
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

        async panel_render() {
            let html = `
                <div class="container">
            `;

            for(let i = 0; i < this.game.panel.length; i++) {
                html += `<div class="lane">`;

                for(let j = 0; j < this.game.panel[i].length; j++) {
                    switch(this.game.panel[i][j]) {
                        case 0: {
                            html += `<div class="card"></div>`;
                            break;
                        }
                    }
                }

                html += `</div>`;
            }

            html += `
                </div>
            `;

            document.querySelector('.algo-game').innerHTML = html;
        },

        async initialize() {
            this.game = {
                panel: []
            };

            for(let i = 0; i < 8; i++) {
                this.game.panel[i] = [];

                for(let j = 0; j < 5; j++) {
                    this.game.panel[i][j] = 0;
                }
            }

            console.log(this.game);

            this.panel_render();

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