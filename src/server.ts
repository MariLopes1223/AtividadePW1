import express, {Request, Response, NextFunction } from 'express';
import {v4 as uuidv4} from 'uuid';

const server = express();
server.use(express.json());

type Technology={
    id: String;
    title: string;
    deadline: Date;
    create_at: Date;
    studied: boolean;
}

type UserBody ={
    id: String;
    name: string;
    username: string;
    tecnologias: Technology[];
}
const user = [] as UserBody[];

/*middleware*/
function checkExistsUserAccount(req: Request, res:Response, next:NextFunction){
    const {username} = req.headers;

    const userFound = user.find((user) => user.username == username);
    if(!userFound){
        return res.status(400).json({error: "user not found"});
    }
    req.user = userFound;
    return next();
}

//rotas relacionadas ao usuário

//criar um novo usuário
server.post('/users', (req, res)=> {
   const {name, username} = req.body as UserBody;

   const userExiste= user.some((user)=>user.username ===username);
   if (userExiste) {
    res.status(400).json({error: 'Já existe um usuário com esse nome'});
   }
   const novoUsuario= {
    id: uuidv4(),
    name,
    username,
    tecnologias: []
   }

   user.push(novoUsuario);

   return res.status(201).json(novoUsuario);
});

//pegar todos os usuários
server.get('/users', checkExistsUserAccount, (req, res) => {
    const { user } = req;
    return res.status(200).json(user);
})


// rotas relacionadas com as tecnologia do usuario 

//inserir nova tecnologia
server.post('/technologies', checkExistsUserAccount, (req, res) => {
    const {title, deadline} = req.body as Technology;

    const newTechnology: Technology = {
        id: uuidv4(),
        title,
        studied: false,
        deadline: new Date(deadline),
        create_at: new Date(),
    }

    const {user} = req;
    user.tecnologias.push(newTechnology);

    return res.status(201).json(newTechnology);
})

//pegar todas as tecnologias
server.get('/technologies', checkExistsUserAccount, (req, res) => {
    const { user } = req;
    return res.status(200).json(user.tecnologias);
});

//alterar title e deadline de uma tecnologia
server.put('/technologies/:id', checkExistsUserAccount, (req, res) => {
    const {title,deadline} = req.body as Technology;
    const {id} = req.params;

    const technologyFound: Technology = req.user.tecnologias.find(tech => tech.id == id);
    if(!technologyFound){
        res.status(400).json({erro:"Tecnologia não encontrada"})
    }
    technologyFound.title = title;
    technologyFound.deadline = new Date(deadline);

    return res.status(201).json(technologyFound);
    
});

//mudar o valor de "studied" de uma tecnologia
server.patch('/technologies/:id/studied', checkExistsUserAccount, (req, res) => {
    const { studied } = req.body as Technology;
    const { id } = req.params;

    const technologyFound: Technology = req.user.tecnologias.find(tech => tech.id == id);
    if(!technologyFound){
        res.status(400).json({erro:"Tecnologia não encontrada"})
    }

    technologyFound.studied = studied;

    return res.status(200).json(technologyFound);
});

//deletar uma tecnologia
server.delete('/technologies/:id', checkExistsUserAccount, (req, res) => {
    const { id } = req.params;

    const technologyFound = req.user.tecnologias.find(tech => tech.id == id);
    if(!technologyFound){
        res.status(400).json({erro:"Tecnologia não encontrada"})
    }

    req.user.tecnologias.splice(technologyFound, 1);
    return res.status(200).json({message: "Tecnologia excluída com sucesso"})
});

server.listen(3000, ()=>{
    console.log('server online na porta 3000');   
})