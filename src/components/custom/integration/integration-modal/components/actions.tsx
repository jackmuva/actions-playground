import { useQuery } from '@tanstack/react-query';

type ActionsSectionProps = {
  integration: string;
}

export default function ActionsSection({ integration }: ActionsSectionProps) {
  const actions = useQuery({
    queryKey: ['actions', integration],
    queryFn: async () => {
      const response = await fetch(`https://actionkit.useparagon.com/projects/${process.env.NEXT_PUBLIC_PARAGON_PROJECT_ID}/actions?integrations=${integration}&format=paragon`, {
        headers: {
          //TODO: replace
          'Authorization': `Bearer`
        }
      });
      const data = await response.json();
      return data.actions[integration] ?? [];
    }
  });
  return actions.data?.map((action: { name: string; title: string; description?: string }) => (
    <div key={action.name}>
      <h3>{action.title}</h3>
      <p>{action.description}</p>
    </div>
  ));
}
