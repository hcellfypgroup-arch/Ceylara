import { ContentWrapper } from "@/components/content/content-wrapper";

const sizeChart = [
  { size: "XS", bust: "32 in", waist: "25 in", hip: "35 in" },
  { size: "S", bust: "34 in", waist: "27 in", hip: "37 in" },
  { size: "M", bust: "36 in", waist: "29 in", hip: "39 in" },
  { size: "L", bust: "39 in", waist: "32 in", hip: "42 in" },
  { size: "XL", bust: "42 in", waist: "35 in", hip: "45 in" },
  { size: "XXL", bust: "45 in", waist: "38 in", hip: "48 in" },
];

export default function SizeGuidePage() {
  return (
    <ContentWrapper
      title="Size Guide"
      description="All measurements are body measurements. For a relaxed fit, select one size up."
    >
      <table>
        <thead>
          <tr>
            <th>Size</th>
            <th>Bust</th>
            <th>Waist</th>
            <th>Hip</th>
          </tr>
        </thead>
        <tbody>
          {sizeChart.map((row) => (
            <tr key={row.size}>
              <td>{row.size}</td>
              <td>{row.bust}</td>
              <td>{row.waist}</td>
              <td>{row.hip}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </ContentWrapper>
  );
}

