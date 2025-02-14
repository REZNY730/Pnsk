// Определение компонента 'note-card'
Vue.component('note-card', {
    // Свойства, которые компонент принимает
    props: ['card', 'isSecondColumn', 'secondColumnCardCount'],
    // Шаблон компонента
    template: `
        <div class="card">
            <h3>{{ card.title }}</h3>
            <input type="text" v-model="card.title" placeholder="Заголовок карточки" class="form-control" />
            <ul>
                <li v-for="(item, itemIndex) in card.items" :key="itemIndex" class="list-item">
                    <input type="checkbox" v-model="item.completed" @change="updateCard" :disabled="!isSecondColumn && secondColumnCardCount >= 5">
                    <input type="text" v-model="item.text" placeholder="Пункт списка" class="form-control" />
                </li>
            </ul>
            <input type="text" v-model="newItemText" placeholder="Новый пункт списка" class="form-control" />
            <button @click="addItem" :disabled="itemCount >= 5">Добавить пункт</button>
            <button @click="removeCard(card.id)">Удалить</button>
            <p v-if="card.completedDate">Завершено: {{ card.completedDate }}</p>
        </div>
    `,
    // Локальные данные компонента
    data() {
        return {
            newItemText: '', // Текст нового пункта
        };
    },
    // Вычисляемые свойства
    computed: {
        itemCount() {
            return this.card.items.length;
        }
    },
    // Методы компонента
    methods: {
        // Метод для удаления карточки
        removeCard(cardId) {
            this.$emit('remove-card', cardId); // Генерирует событие для удаления карточки
        },
        // Метод для обновления карточки
        updateCard() {
            this.$emit('update-card', this.card); // Генерирует событие для обновления карточки
        },
        // Метод для добавления нового пункта
        addItem() {
            // Проверка, что текст не пустой и количество пунктов меньше 5
            if (this.newItemText.trim() !== '' && this.itemCount < 5) {
                // Добавление нового пункта в карточку
                this.card.items.push({ text: this.newItemText, completed: false });
                this.newItemText = ''; // Очистка поля ввода
                this.updateCard(); // Обновление карточки
            }
        }
    }
});
// Определение компонента 'note-column'
Vue.component('note-column', {
    // Свойства, которые компонент принимает
    props: ['column'],
    // Шаблон компонента
    template: `
        <div class="column">
            <h2>{{ column.title }}</h2>
            <note-card
                v-for="(card, cardIndex) in column.cards"
                :key="card.id"
                :card="card"
                :isSecondColumn="column.title === 'Столбец 2'"
                :secondColumnCardCount="getSecondColumnCardCount()"
                @remove-card="$emit('remove-card', $event)"
                @update-card="$emit('update-card', $event)"
            ></note-card>
            <button v-if="canAddCard(column)" @click="$emit('add-card', column)">Добавить карточку</button>
        </div>
    `,
    // Методы компонента
    methods: {
        // Проверка, можно ли добавить новую карточку в колонку
        canAddCard(column) {
            return !(column.title === 'Столбец 1' && column.cards.length >= 3) && // Не более 3 карточек в первом столбце
                !(column.title === 'Столбец 2' && column.cards.length >= 5); // Не более 5 карточек во втором столбце
        },
        // Получение количества карточек во втором столбце
        getSecondColumnCardCount() {
            const secondColumn = this.$parent.columns.find(col => col.title === 'Столбец 2');
            return secondColumn ? secondColumn.cards.length : 0; // Возвращает количество карточек или 0
        }
    }
});

// Определение основного компонента 'note-app'
Vue.component('note-app', {
    // Локальные данные компонента
    data() {
        return {
            columns: [ // Массив колонок
                { title: 'Столбец 1', cards: [] },
                { title: 'Столбец 2', cards: [] },
                { title: 'Столбец 3', cards: [] }
            ],
            nextCardId: 1 // Идентификатор для следующей карточки
        };
    },

    // Метод, который вызывается при создании компонента
    created() {
        this.loadCards(); // Загрузка карточек из localStorage
    },

    // Методы компонента
    methods: {
        // Загрузка карточек из localStorage
        loadCards() {
            const savedData = JSON.parse(localStorage.getItem('cards'));
            if (savedData) {
                this.columns = savedData.columns; // Восстановление колонок
                this.nextCardId = savedData.nextCardId; // Восстановление следующего идентификатора карточки
            }
        },
        // Сохранение карточек в localStorage
        saveCards() {
            localStorage.setItem('cards', JSON.stringify({ columns: this.columns, nextCardId: this.nextCardId }));
        },
        // Добавление новой карточки в указанную колонку
        addCard(column) {
            const newCard = {
                id: this.nextCardId++, // Увеличение идентификатора
                title: `Карточка ${this.nextCardId}`, // Заголовок новой карточки
                color: '#f9f9f9', // Цвет карточки
                items: [ // Начальные пункты карточки
                    { text: 'Пункт 1', completed: false },
                    { text: 'Пункт 2', completed: false },
                    { text: 'Пункт 3', completed: false }
                ],
                completedDate: null // Дата завершения
            };
            column.cards.push(newCard); // Добавление карточки в колонку
            this.saveCards(); // Сохранение изменений
        },
        // Удаление карточки по ее идентификатору
        removeCard(cardId) {
            for (let column of this.columns) {
                const index = column.cards.findIndex(card => card.id === cardId);
                if (index !== -1) {
                    column.cards.splice(index, 1); // Удаление карточки из колонки
                    this.saveCards(); // Сохранение изменений
                    break;
                }
            }
        },
        // Обновление состояния карточки
        updateCard(card) {
            const completedItems = card.items.filter(item => item.completed).length; // Количество выполненных пунктов
            const totalItems = card.items.length; // Общее количество пунктов

            if (totalItems > 0) {
                const completionRate = completedItems / totalItems; // Процент выполненных пунктов

                // Перемещение карточки в другую колонку в зависимости от выполнения пунктов
                if (completionRate > 0.5 && this.columns[0].cards.includes(card)) {
                    this.moveCard(card, 1); // Перемещение во второй столбец
                } else if (completionRate === 1 && this.columns[1].cards.includes(card)) {
                    this.moveCard(card, 2); // Перемещение в третий столбец
                    card.completedDate = new Date().toLocaleString(); // Установка даты завершения
                }
            }
            this.saveCards(); // Сохранение изменений
        },
        // Перемещение карточки из одной колонки в другую
        moveCard(card, targetColumnIndex) {
            for (let column of this.columns) {
                const index = column.cards.findIndex(c => c.id === card.id);
                if (index !== -1) {
                    column.cards.splice(index, 1); // Удаление карточки из текущей колонки
                    this.columns[targetColumnIndex].cards.push(card); // Добавление карточки // в целевую колонку
                    break;
                }
            }
        }
    },

    // Шаблон основного компонента
    template: `
        <div>
            <div class="columns">
                <note-column
                    v-for="(column, index) in columns"
                    :key="index"
                    :column="column"
                    @remove-card="removeCard"
                    @update-card="updateCard"
                    @add-card="addCard"
                ></note-column>
            </div>
        </div>
    `
});
// Создание экземпляра Vue приложения
new Vue({
    el: '#app' // Привязка приложения к элементу с id 'app'
});