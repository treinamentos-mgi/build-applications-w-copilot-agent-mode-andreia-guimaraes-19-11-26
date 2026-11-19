import type { ReactNode } from 'react';
import type { ResourceState } from '../hooks/useJsonResource.js';

type CardProps = { title: string; description: string; children: ReactNode };
export function CapabilityCard({ title, description, children }: CardProps) {
  return <section className="card h-100"><div className="card-body"><h2 className="h4">{title}</h2><p>{description}</p>{children}</div></section>;
}

type ContentProps<T> = {
  state: ResourceState<T>;
  isEmpty: (data: T) => boolean;
  emptyMessage: string;
  children: (data: T) => ReactNode;
};
export function ResourceContent<T>({ state, isEmpty, emptyMessage, children }: ContentProps<T>) {
  if (state.status === 'loading') return <p role="status">Carregando...</p>;
  if (state.status === 'error') return <div role="alert" className="alert alert-danger">Não foi possível carregar os dados. Tente novamente mais tarde.</div>;
  if (isEmpty(state.data)) return <p className="text-muted">{emptyMessage}</p>;
  return <>{children(state.data)}</>;
}
