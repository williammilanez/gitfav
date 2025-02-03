import { GithubUser } from "./GithubUser.js"

// classe que vai conter a lógica dos dados
// como os dados serão estruturados
export class Favorites {
    constructor(root) {
        this.root = document.querySelector(root)
        this.load()
    }

    // função para carregamento dos dados
    load() {
        // os dados serão uma array contendo um objeto
        this.entries = JSON.parse(localStorage.getItem('@github-favorites:')) || []
    }

    // função para salvar os usuários (adições e remoções) no local storage
    save() {
        localStorage.setItem('@github-favorites:', JSON.stringify(this.entries)) // transforma o this.entries em uma string em formato de JSON para salvar nesse local storage
    }

    // adicionar / buscar user no github
    // função assíncrona - promisse (aguarda para depois continuar nas próximas linhas)
    async add(username) {
        try { // tente

            // verificando se usuário já existe
            const userExists = this.entries.find(entry => entry.login === username)

            if(userExists) {
                throw new Error('Usuário já cadastrado!')
            }

            // procurando usuário
            const user = await GithubUser.search(username) // aguarda essa promessa (essa linha)

            if(user.login === undefined) {
                throw new Error('Usuário não encontrado!') // objeto de erro, vai para o catch
            } 

            this.entries = [user, ...this.entries] // criano nova array, colocando novo usuário e trazendo de volta todos os elementos que tinha antes
            this.update()
            this.save()

        }   catch(error) {
            alert(error.message)
        }
    }

    // deletar
    delete(user) {
        // Higher-order functions (map, filter, find, reduce)
        // filter, serve para filtrar
        const filteredEntries = this.entries.filter(entry => entry.login !== user.login)

        this.entries = filteredEntries
        this.update()
        this.save()
    }
}



//////////////////////////////////////////////////////////////////////////////////////////////////

// classe que vai criar a visualização e eventos do HTML
export class FavoritesView extends Favorites {
    constructor(root) {
        super(root)

        this.tbody = this.root.querySelector('table tbody')

        this.update()
        this.onadd()
    }

    onadd() {
        const addButton = this.root.querySelector('.search button')
        addButton.onclick = () => {
            const { value } = this.root.querySelector('.search input')

            this.add(value)
        }
    }

    // atualiza os usuários
    update() {
        this.removeAllTr()
        
        // mapeamento, objetos que preciso
        this.entries.forEach( user => {
            const row = this.createRow() // isso retorna uma 'tr'

            // serve para mudar o usuário
            row.querySelector('.user img').src = `https://github.com/${user.login}.png`
            row.querySelector('.user img').alt = `Imagem de ${user.name}`
            row.querySelector('.user a').href = `https://github.com/${user.login}`
            row.querySelector('.user p').textContent = user.name
            row.querySelector('.user span').textContent = user.login
            row.querySelector('.repositories').textContent = user.public_repos
            row.querySelector('.followers').textContent = user.followers

            this.tbody.append(row) //append = funcionalidade que recebe um elemento

            row.querySelector('.remove').onclick = () => {
                const isOk = confirm('Tem certeza de que deseja desfavoritar esta pessoa?')
                if(isOk) {
                    this.delete(user)
                }
            }
        })

        // verifica se não há usuários cadastrados para alternar a visibilidade da imagem oculta (hide)
        const emptyState = this.root.querySelector('.empty');
        if (this.entries.length === 0) {
            emptyState.classList.remove('hide'); // mostra a div
        } else {
            emptyState.classList.add('hide'); // esconde a div
        }
    }

    createRow() {
        const tr = document.createElement('tr');

        tr.innerHTML = `
        <tr>
            <td class="user">
            <img
                src="https://github.com/williammilanez.png"
                alt="Foto de Sarah Victoria"
            />
            <a href="https://github.com/williammilanez" target="_blank">
                <p>Sarah Victoria</p>
                <span>/williammilanez</span>
            </a>
            </td>

            <td class="repositories">25</td>

            <td class="followers">65</td>

            <td><button class="remove">Remover</button></td>
        </tr>
        `

        return tr;
    }

    removeAllTr() {
        this.tbody.querySelectorAll('tr').forEach(tr => {
            tr.remove()
        });
    }
}