import { DataSection } from './DataSection';
import { DetailField } from './DetailField';

interface GeneralInformationProps {
  type: string;
  kind: string | null;
  networkFlow: string;
  status: string;
  createdAt: string;
  expectedAt: string | null;
}

export const GeneralInformationSection = ({
  type,
  kind,
  networkFlow,
  status,
  createdAt,
  expectedAt
}: GeneralInformationProps) => {
  return (
    <DataSection title="General Information" showDivider>
      <DetailField label="Status" value={status} />
      <DetailField label="Transaction Type" value={type} />
      {kind && <DetailField label="Transaction Kind" value={kind} />}
      <DetailField label="Network Flow" value={networkFlow} />
      <DetailField label="Created" value={createdAt} />
      {expectedAt && (
        <DetailField label="Expected" value={expectedAt} />
      )}
    </DataSection>
  );
};
