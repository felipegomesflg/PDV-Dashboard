export abstract class IRepository<T> {
  constructor(){}
  abstract List(type: T): T[];
  abstract Add(entity: T);
  abstract Delete(entity: T);
  abstract Update(entity: T);
  abstract FindById(Id: number): T;
}
