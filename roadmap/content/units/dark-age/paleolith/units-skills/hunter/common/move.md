## Передвинуть

Перемещение временных объектов. Позволяет адаптировать ландшафт к текущим потребностям игрока: создать завал, убрать мешающий объект с потенциального маршрута. Позволяет вручную переносить ресурсы не экономическим юнитам

### Тип навыка

Активный

### Допустимые цели

Временные объекты, изменение положения на карте которых допустимо:

Типы целей:

- Ресурс - если обозначить конечной точкой маршрута стойбище (ресурс будет добавлен в хранилище племени)
- Препятствие - можно убрать с пути, перенести в иную точку карты, образуя или расчищая завалы

### Ограничения

Ограничения по типу объекта, которые можно переместить. У всех временных объектов должно быть прописано условие: доступно для перемещения или нет 

Ограничение по точкам маршрута: куда можно перенести объект, а куда нет

### Зона действия

Не ограничена 

### Модификаторы

Нет.

### Стоимость использования

Нет.

### Время восстановления (Cooldown)

Нет.

### Время применения / Каст

Зависимо от построенного маршрута (вес не учитываем, считаем за игровую условность).

### Эффекты

Перемещение объекта в заданную точку 

### Визуальные эффекты

Анимация юнита перемещающего объект в заданную точку

### Звуковые эффекты

Звуки волочения: шуршание листвы, треск кустов

### Связанные задачи

**Графика:**
1. Анимация юнита перемещающего объект с места на место. Возможны варианты:
   - Юнит может волочь нечто большое, укрытое за слоем поднимаемой пыли (позволит сэкономить на отрисовке в анимации каждого доступного объекта)

**Звук:**
1. Записать звуки волочения крупного объекта по земле

**Гейм-дизайн:**
1. Проработать механику изменения ландшафта при помощи временных объектов
2. Учесть возможность мануального перемещения ресурсов при разработке логистики
3. Учесть возможность переноса объектов типа ресурс при разработке экономики
4. Детализировать механику типов переносимых объектов, создать таблицу для с наименованиями для каждого типа

**Программирование:**
1. Разработать механику изменения ландшафта при активации навыка. В одном месте временный объект (например, камень) исчезает, в другом появляется. 
2. Разработать механику прокладки маршрутов при перемещении объекта

**Требования к UX/UI:**
1. Иконка навыка
2. Подсветка доступных для перемещения объектов, при нажатии на иконку
3. Подсветка конечных точек (областей) в которые можно перенести объект
4. Индикатор недопустимости действия при срабатывании ограничения на конечную точку перемещения объекта