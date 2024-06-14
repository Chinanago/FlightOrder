// 評価関数
function calculateFitness(order, roles) {
    let roleIndices = {};

    // 役職ごとに部員の順番を記録
    order.forEach((member, index) => {
        if (roles[member] && roles[member].roles) {
            roles[member].roles.forEach(role => {
                if (!roleIndices[role]) {
                    roleIndices[role] = [];
                }
                roleIndices[role].push(index);
            });
        }
    });

    // 距離の二乗和を計算
    let totalDistance = 0;
    for (let role in roleIndices) {
        let indices = roleIndices[role];
        for (let i = 0; i < indices.length; i++) {
            for (let j = i + 1; j < indices.length; j++) {
                let distance = indices[j] - indices[i];
                totalDistance += distance * distance;
                // 同じ役職者が隣り合っていると評価を-100にする
                if (distance === 1) {
                    totalDistance -= 100;
                }
            }
        }
    }

    // 下級生が1番にならないようにする
    if (roles[order[0]] && roles[order[0]].category === '下級生') {
        totalDistance -= 1000;
    }

    // 下級生の連続を評価減少
    for (let i = 0; i < order.length - 1; i++) {
        if (roles[order[i]] && roles[order[i]].category === '下級生' && 
            roles[order[i + 1]] && roles[order[i + 1]].category === '下級生') {
            totalDistance -= 50;
        }
    }

    return totalDistance;
}

// 遺伝的アルゴリズムの関数
function geneticAlgorithm(members, roles) {
    const populationSize = 100;
    const generations = 1000;
    const mutationRate = 0.15;
    let population = [];

    // 初期集団を生成
    for (let i = 0; i < populationSize; i++) {
        let order = members.slice();
        for (let j = order.length - 1; j > 0; j--) {
            const k = Math.floor(Math.random() * (j + 1));
            [order[j], order[k]] = [order[k], order[j]];
        }
        population.push(order);
    }

    // 世代を進める
    for (let gen = 0; gen < generations; gen++) {
        // 評価
        let fitnesses = population.map(order => calculateFitness(order, roles));

        // エリート選択
        let maxFitness = Math.max(...fitnesses);
        let maxFitnessIndex = fitnesses.indexOf(maxFitness);
        let elite = population[maxFitnessIndex];

        // 新しい集団を生成
        let newPopulation = [elite]; // エリートを次世代に残す
        for (let i = 1; i < populationSize; i++) {
            let parent1 = select(population, fitnesses);
            let parent2 = select(population, fitnesses);
            let child = crossover(parent1, parent2);
            if (Math.random() < mutationRate) {
                child = mutate(child);
            }
            newPopulation.push(child);
        }
        population = newPopulation;

        // 50世代ごとにfitnessをlogに出力
        if (gen % 50 === 0) {
            let maxFitness = Math.max(...fitnesses);
            console.log(`Generation ${gen}: Max Fitness = ${maxFitness}`);
        }
    }

    // 最も適応度の高い順番を返す
    let fitnesses = population.map(order => calculateFitness(order, roles));
    let maxFitness = Math.max(...fitnesses);
    let maxFitnessIndex = fitnesses.indexOf(Math.max(...fitnesses));
    console.log(population[maxFitnessIndex]);
    return [population[maxFitnessIndex], maxFitness];
}

// 選択関数
function select(population, fitnesses) {
    let totalFitness = fitnesses.reduce((a, b) => a + b, 0);
    let threshold = Math.random() * totalFitness;
    let sum = 0;
    for (let i = 0; i < population.length; i++) {
        sum += fitnesses[i];
        if (sum >= threshold) {
            return population[i];
        }
    }
    return population[population.length - 1];
}

// 交叉関数
function crossover(parent1, parent2) {
    let start = Math.floor(Math.random() * parent1.length);
    let end = start + Math.floor(Math.random() * (parent1.length - start));
    let child = parent1.slice(start, end);
    parent2.forEach(member => {
        if (!child.includes(member)) {
            child.push(member);
        }
    });
    return child;
}

// 突然変異関数
function mutate(order) {
    const index1 = Math.floor(Math.random() * order.length);
    let index2 = Math.floor(Math.random() * order.length);
    while (index1 === index2) {
        index2 = Math.floor(Math.random() * order.length);
    }
    [order[index1], order[index2]] = [order[index1], order[index2]];
    return order;
}