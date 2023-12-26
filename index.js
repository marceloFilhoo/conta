//modulos externos
const inquirer = require('inquirer')
const chalk = require('chalk')
//modulos internos
const fs = require('fs')

operacao()

function operacao() {
    inquirer.prompt([{
        type: "list",
        name: "acao",
        message: 'O que você deseja fazer?',
        choices: [
            'Criar conta',
            'Consultar saldo',
            'Depositar',
            'Sacar',
            'Sair',
        ]
    }]).then((answer) => {
        const acao = answer['acao']

        if (acao === 'Criar conta') {
            conta();
        } else if (acao === 'Consultar saldo') {
            consultaSaldo()
        } else if (acao === 'Depositar') {
            depositar()
        } else if (acao === 'Sacar') {
            sacar()
        } else if (acao === 'Sair') {
            console.log(chalk.bgBlue.black('Obrigado por usar o meu sistema'))
            process.exit()
        }



    }).catch((err) => console.log(err))
}

//criando conta

function conta() {
    console.log(chalk.bgGreen.black('Parabens por escolher o nosso banco!'))
    console.log(chalk.green('Defina as opções da sua conta a seguir'))
    montandoConta()
}

function montandoConta() {
    inquirer.prompt([{
        name: 'nomeConta',
        message: 'Digite o nome da sua conta',
    }]).then((answer) => {
        const nomeConta = answer['nomeConta']

        if (!nomeConta) {
            console.log(chalk.bgRed.black('ocorreu algum erro tente novamente mais tarde'))
            return montandoConta()
        }
        if (!fs.existsSync('accounts')) {
            fs.mkdirSync('accounts')
        }//verificando se tem uma pasta e caso nao tenha criando uma

        if (fs.existsSync(`accounts/${nomeConta}.json`)) {
            console.log(chalk.bgRed.black('Esta conta ja existe tente novamente'))
            return montandoConta()//tem que usar o return
        }//verificando se tem um arquivo dentro da pasta accounts com o nome escrito ali

        fs.writeFileSync(`accounts/${nomeConta}.json`, '{"valorConta": 0}', function (err) { console.log(err) })//criando o arquivo
        console.log(chalk.green('Parabens sua conta foi criada'))
        operacao()

    }).catch((err) => console.log(err))
}
//depositar na conta
function depositar() {
    inquirer.prompt([{
        name: 'nomeConta',
        message: 'qual o nome da conta de deposito'
    }]).then((answer) => {
        const nomeConta = answer['nomeConta']

        if (!checkConta(nomeConta)) {
            return depositar()
        }//verificando se a conta existe


        inquirer.prompt([{
            name: 'valorDeposito',
            message: 'Qual o valor para depositar'
        }]).then((answer) => {
            const valorDeposito = answer['valorDeposito']
            if (!valorDeposito) {
                console.log(chalk.bgRed.black('ocorreu algum erro tente novamente mais tarde'))
                return depositar()
            }
            adicionarValor(nomeConta, valorDeposito)
            operacao()

        }).catch((err) => console.log(err))


    }).catch((err) => { console.log(err) })
}

function checkConta(nomeConta) {
    if (!fs.existsSync(`accounts/${nomeConta}.json`)) {
        console.log(chalk.bgRed.black('esta conta nao existe tente outra'))
        return false
    }
    return true
}

function adicionarValor(nomeConta, valorDeposito) {
    const saldo = getConta(nomeConta)
    saldo.valorConta = parseFloat(valorDeposito) + parseFloat(saldo.valorConta) //adicionando o valor a conta
    fs.writeFileSync(`accounts/${nomeConta}.json`, JSON.stringify(saldo), function (err) { console.log(err) })// escrevendo na conta o valor alterado
    console.log(chalk.green(`Foi depositado o valor de R$${valorDeposito} na sua conta com sucesso`))
}

function getConta(nomeConta) {
    const contaJSON = fs.readFileSync(`accounts/${nomeConta}.json`, {
        encoding: 'utf-8',
        flag: 'r'//simbolizando que é para so ler
    })//lendo e armazenando o json em uma string
    return JSON.parse(contaJSON)// retornando a string em json novamente
}
//consulta de salto
function consultaSaldo() {
    inquirer.prompt([{
        name: 'nomeConta',
        message: 'qual o nome da conta para verificar'
    }]).then((answer) => {
        const nomeConta = answer['nomeConta']
        if (!checkConta(nomeConta)) {
            return consultaSaldo()
        }
        const conta = getConta(nomeConta)
        console.log(chalk.bgBlue(`seu saldo é de R$${conta.valorConta}`))
        operacao()
    }).catch((err) => { console.log(err) })


}
//sacar da conta
function sacar() {
    inquirer.prompt([{
        name: 'nomeConta',
        message: 'qual o nome da conta para sacar'
    }]).then((answer) => {
        const nomeConta = answer['nomeConta']

        if (!checkConta(nomeConta)) {
            return sacar()
        }

        inquirer.prompt([{
            name: 'valorSaque',
            message: 'qual o valor para sacar'
        }]).then((answer) => {
            const valorSaque = answer['valorSaque']

            removerValor(nomeConta, valorSaque)

        }).catch((err) => { console.log(err) })

    }).catch((err) => { console.log(err) })
}
function removerValor(nomeConta, valorSaque) {
    const saldo = getConta(nomeConta)
    if (!valorSaque) {
        console.log(chalk.bgRed.black('ocorreu um erro tente novamente'))
        return sacar()
    }
    if (saldo.valorConta < valorSaque) {
        console.log(chalk.bgRed.black('valor indisponivel para saque'))
        return sacar()
    }
    saldo.valorConta = parseFloat(saldo.valorConta) - parseFloat(valorSaque) //removendo o valor a conta
    fs.writeFileSync(`accounts/${nomeConta}.json`, JSON.stringify(saldo), function (err) { console.log(err) })
    console.log(chalk.green(`Foi sacado o valor de R$${valorSaque} da sua conta com sucesso`))
    operacao()
}
