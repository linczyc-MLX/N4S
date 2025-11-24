import React, { useState } from 'react';
import { Home, Users, TrendingUp, Calculator, CheckSquare } from 'lucide-react';

const Not4SaleWorkflow = () => {
  const [activeTab, setActiveTab] = useState('kyc');

  const tabs = [
    { id: 'kyc', label: 'KYC Workflow', icon: Users },
    { id: 'kym', label: 'KYM Workflow', icon: TrendingUp },
    { id: 'scoring', label: 'Scoring Model', icon: Calculator },
    { id: 'matching', label: 'Matching System', icon: CheckSquare }
  ];

  return (
    <div className="w-full max-w-6xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Home className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-800">Not4Sale Workflow System</h1>
        </div>
        <p className="text-gray-600">KYC (Know Your Client) & KYM (Know Your Market) Framework</p>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="flex border-b">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-6 py-4 flex items-center justify-center gap-2 font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="p-8">
          {activeTab === 'kyc' && <KYCWorkflow />}
          {activeTab === 'kym' && <KYMWorkflow />}
          {activeTab === 'scoring' && <ScoringModel />}
          {activeTab === 'matching' && <MatchingSystem />}
        </div>
      </div>
    </div>
  );
};

const KYCWorkflow = () => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-gray-800 mb-4">KYC: Know Your Client (Taste Exploration)</h2>
    <p className="text-gray-600 mb-6">Build detailed client personas that model lifestyle, preferences, and requirements</p>

    <div className="space-y-6">
      <WorkflowPhase
        phase="1"
        title="Initial Discovery"
        duration="1-2 weeks"
        steps={[
          'Intake questionnaire covering family structure, daily routines, and lifestyle priorities',
          'Visual preference survey (architecture styles, interior design, materials, colors)',
          'Space usage assessment (how they currently use their home)',
          'Entertainment and socializing patterns (formal vs casual, frequency, guest count)',
          'Privacy and noise sensitivity requirements'
        ]}
        deliverable="Client Profile Overview"
      />

      <WorkflowPhase
        phase="2"
        title="Deep Dive Sessions"
        duration="2-3 weeks"
        steps={[
          'One-on-one interviews with each family member (age-appropriate)',
          'Day-in-the-life mapping exercises',
          'Hobby and interest deep dive (space/equipment needs)',
          'Work-from-home requirements and patterns',
          'Wellness and fitness priorities',
          'Technology and smart home expectations',
          'Sustainability and environmental values'
        ]}
        deliverable="Detailed Lifestyle Map"
      />

      <WorkflowPhase
        phase="3"
        title="Spatial Requirements Analysis"
        duration="1-2 weeks"
        steps={[
          'Room-by-room functional requirements',
          'Flow and adjacency preferences',
          'Storage and organization needs',
          'Natural light and view priorities',
          'Indoor-outdoor connection desires',
          'Future-proofing considerations (aging in place, family growth)',
          'Accessibility requirements'
        ]}
        deliverable="Spatial Requirements Matrix"
      />

      <WorkflowPhase
        phase="4"
        title="Design Preferences & Budget Alignment"
        duration="1 week"
        steps={[
          'Material and finish preferences with price sensitivity',
          'Must-haves vs nice-to-haves prioritization',
          'Budget allocation across categories',
          'Quality expectations for different spaces',
          'Brand preferences and values alignment',
          'Timeline and occupancy requirements'
        ]}
        deliverable="Design Brief & Budget Framework"
      />

      <WorkflowPhase
        phase="5"
        title="Persona Synthesis"
        duration="1 week"
        steps={[
          'Compile all data into comprehensive client persona',
          'Identify potential conflicts between desires and market realities',
          'Create weighted priority matrix',
          'Develop personalization vs resale strategy',
          'Present persona to client for validation and refinement'
        ]}
        deliverable="Complete Client Persona Document"
      />
    </div>
  </div>
);

const KYMWorkflow = () => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-gray-800 mb-4">KYM: Know Your Market (Avatar Identification)</h2>
    <p className="text-gray-600 mb-6">Identify and profile the target buyer demographics in the target market area</p>

    <div className="space-y-6">
      <WorkflowPhase
        phase="1"
        title="Market Selection & Definition"
        duration="1 week"
        steps={[
          'Define geographic boundaries (neighborhood, school district, commute radius)',
          'Identify property type and price range',
          'Research recent sales and active listings',
          'Analyze days on market and price per square foot trends',
          'Review absorption rates and inventory levels'
        ]}
        deliverable="Market Definition Report"
      />

      <WorkflowPhase
        phase="2"
        title="Demographic Research"
        duration="2-3 weeks"
        steps={[
          'Census data analysis (income, age, household composition)',
          'Employment and industry concentration in area',
          'Education levels and school quality metrics',
          'Migration patterns (who is moving in/out)',
          'Cultural and lifestyle amenities in area',
          'Transportation and commute patterns',
          'Growth projections and development pipeline'
        ]}
        deliverable="Demographic Profile"
      />

      <WorkflowPhase
        phase="3"
        title="Buyer Avatar Development"
        duration="2 weeks"
        steps={[
          'Segment buyers into 3-5 primary avatars based on data',
          'For each avatar define: age range, family structure, career stage',
          'Income and wealth profile (liquidity, financing needs)',
          'Lifestyle priorities and values',
          'Space requirements and preferences',
          'Design aesthetic preferences',
          'Technology adoption and expectations',
          'Sustainability priorities',
          'Time horizon and investment goals'
        ]}
        deliverable="Buyer Avatar Profiles (3-5)"
      />

      <WorkflowPhase
        phase="4"
        title="Competitive Analysis"
        duration="1-2 weeks"
        steps={[
          'Analyze comparable properties that sold quickly at premium',
          'Study properties with extended DOM or price reductions',
          'Identify common features in successful vs unsuccessful listings',
          'Review finishes, amenities, and layouts that drive offers',
          'Assess what buyers are willing to pay premium for',
          'Identify over-improvements that do not return value'
        ]}
        deliverable="Competitive Market Analysis"
      />

      <WorkflowPhase
        phase="5"
        title="Avatar Weighting & Prioritization"
        duration="1 week"
        steps={[
          'Quantify size of each avatar segment in target market',
          'Assess purchasing power of each avatar',
          'Calculate potential pool size (segment size × affordability)',
          'Weight avatars by probability and profitability',
          'Create primary, secondary, and tertiary avatar targets',
          'Identify features with broad vs narrow appeal'
        ]}
        deliverable="Weighted Avatar Matrix"
      />
    </div>
  </div>
);

const ScoringModel = () => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-gray-800 mb-4">Property Scoring Model</h2>
    <p className="text-gray-600 mb-6">Quantitative framework for evaluating properties against client needs and market avatars</p>

    <div className="bg-blue-50 border-l-4 border-blue-600 p-4 mb-6">
      <h3 className="font-bold text-blue-900 mb-2">Scoring Framework Overview</h3>
      <p className="text-blue-800 text-sm">Each property receives two scores: Client Fit Score (0-100) and Market Appeal Score (0-100). The optimal property maximizes both scores.</p>
    </div>

    <div className="space-y-6">
      <ScoringCategory
        title="Client Fit Score (0-100)"
        description="How well the property matches the client persona"
        categories={[
          {
            name: 'Spatial Requirements',
            weight: 25,
            criteria: [
              'Room count and configuration (0-5 points)',
              'Square footage alignment (0-5 points)',
              'Flow and adjacencies (0-5 points)',
              'Indoor-outdoor connection (0-5 points)',
              'Storage and organization (0-5 points)'
            ]
          },
          {
            name: 'Lifestyle Alignment',
            weight: 25,
            criteria: [
              'Entertainment spaces (0-5 points)',
              'Work-from-home functionality (0-5 points)',
              'Hobby and interest support (0-5 points)',
              'Privacy and acoustics (0-5 points)',
              'Wellness and fitness facilities (0-5 points)'
            ]
          },
          {
            name: 'Design & Aesthetics',
            weight: 20,
            criteria: [
              'Architectural style match (0-5 points)',
              'Interior design aesthetic (0-5 points)',
              'Material and finish quality (0-5 points)',
              'Natural light and views (0-5 points)'
            ]
          },
          {
            name: 'Location & Context',
            weight: 15,
            criteria: [
              'Commute and accessibility (0-5 points)',
              'School district quality (0-5 points)',
              'Neighborhood amenities (0-5 points)'
            ]
          },
          {
            name: 'Future-Proofing',
            weight: 15,
            criteria: [
              'Adaptability for life changes (0-5 points)',
              'Technology infrastructure (0-5 points)',
              'Sustainability features (0-5 points)'
            ]
          }
        ]}
      />

      <ScoringCategory
        title="Market Appeal Score (0-100)"
        description="How well the property appeals to weighted avatar demographics"
        categories={[
          {
            name: 'Avatar Alignment',
            weight: 35,
            criteria: [
              'Primary avatar fit (0-10 points)',
              'Secondary avatar fit (0-5 points)',
              'Tertiary avatar fit (0-5 points)',
              'Feature universality (0-10 points)',
              'Broad appeal elements (0-5 points)'
            ]
          },
          {
            name: 'Competitive Position',
            weight: 25,
            criteria: [
              'Price positioning (0-10 points)',
              'Feature differentiation (0-5 points)',
              'Value proposition clarity (0-5 points)',
              'Finish quality vs market (0-5 points)'
            ]
          },
          {
            name: 'Market Timing',
            weight: 20,
            criteria: [
              'Inventory levels (0-5 points)',
              'Demand indicators (0-5 points)',
              'Seasonal factors (0-5 points)',
              'Economic conditions (0-5 points)'
            ]
          },
          {
            name: 'Investment Fundamentals',
            weight: 20,
            criteria: [
              'Location appreciation potential (0-5 points)',
              'Cost to personalize vs market value (0-5 points)',
              'Maintenance and carrying costs (0-5 points)',
              'Liquidity factors (0-5 points)'
            ]
          }
        ]}
      />

      <div className="bg-green-50 border-l-4 border-green-600 p-4">
        <h3 className="font-bold text-green-900 mb-3">Composite ROI Score</h3>
        <div className="space-y-2 text-sm text-green-800">
          <p><strong>Formula:</strong> (Client Fit × 0.6) + (Market Appeal × 0.4)</p>
          <p><strong>Interpretation:</strong></p>
          <ul className="list-disc ml-5 space-y-1">
            <li>90-100: Exceptional fit, proceed with confidence</li>
            <li>75-89: Strong candidate, minor compromises acceptable</li>
            <li>60-74: Moderate fit, significant tradeoffs required</li>
            <li>Below 60: Poor fit, reconsider or major renovation needed</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
);

const MatchingSystem = () => (
  <div className="space-y-6">
    <h2 className="text-2xl font-bold text-gray-800 mb-4">Persona-Avatar Matching System</h2>
    <p className="text-gray-600 mb-6">Strategic framework for optimizing client satisfaction while maximizing resale value</p>

    <div className="space-y-6">
      <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
        <h3 className="font-bold text-lg mb-4">Matching Methodology</h3>
        <div className="space-y-4">
          <MatchingStep
            step="1"
            title="Overlay Analysis"
            description="Compare client persona requirements against each weighted avatar profile to identify alignment and gaps"
          />
          <MatchingStep
            step="2"
            title="Feature Categorization"
            description="Classify every design element as: Universal Appeal, Avatar-Specific, Client-Specific, or Polarizing"
          />
          <MatchingStep
            step="3"
            title="Investment Allocation"
            description="Budget distribution: 60% universal, 25% avatar-aligned, 15% client-specific"
          />
          <MatchingStep
            step="4"
            title="Reversibility Assessment"
            description="Identify which client-specific elements can be easily modified by future buyers"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-green-50 p-6 rounded-lg border border-green-200">
          <h3 className="font-bold text-green-900 mb-3 flex items-center gap-2">
            <CheckSquare className="w-5 h-5" />
            High-Value Investments
          </h3>
          <ul className="space-y-2 text-sm text-green-800">
            <li>• Kitchen and primary suite quality</li>
            <li>• Structural improvements (layout, light, flow)</li>
            <li>• Systems and infrastructure</li>
            <li>• Outdoor living spaces</li>
            <li>• Energy efficiency and smart home</li>
            <li>• Universal accessibility features</li>
          </ul>
        </div>

        <div className="bg-red-50 p-6 rounded-lg border border-red-200">
          <h3 className="font-bold text-red-900 mb-3">Personalization Cautions</h3>
          <ul className="space-y-2 text-sm text-red-800">
            <li>• Highly specific hobby spaces</li>
            <li>• Non-standard room configurations</li>
            <li>• Extreme color or material choices</li>
            <li>• Over-building for the neighborhood</li>
            <li>• Removing bedrooms or standard rooms</li>
            <li>• Permanent built-ins for niche uses</li>
          </ul>
        </div>
      </div>

      <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
        <h3 className="font-bold text-blue-900 mb-4">Strategic Decision Matrix</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-blue-200">
                <th className="text-left p-2">Client Priority</th>
                <th className="text-left p-2">Avatar Alignment</th>
                <th className="text-left p-2">Recommendation</th>
              </tr>
            </thead>
            <tbody className="text-blue-800">
              <tr className="border-b border-blue-100">
                <td className="p-2">High</td>
                <td className="p-2">High</td>
                <td className="p-2">✓ Invest fully - maximizes both goals</td>
              </tr>
              <tr className="border-b border-blue-100">
                <td className="p-2">High</td>
                <td className="p-2">Medium</td>
                <td className="p-2">✓ Invest with avatar-friendly execution</td>
              </tr>
              <tr className="border-b border-blue-100">
                <td className="p-2">High</td>
                <td className="p-2">Low</td>
                <td className="p-2">⚠ Keep reversible or budget-conscious</td>
              </tr>
              <tr className="border-b border-blue-100">
                <td className="p-2">Medium</td>
                <td className="p-2">High</td>
                <td className="p-2">✓ Invest for resale value</td>
              </tr>
              <tr className="border-b border-blue-100">
                <td className="p-2">Medium</td>
                <td className="p-2">Low</td>
                <td className="p-2">✗ Defer or minimize investment</td>
              </tr>
              <tr>
                <td className="p-2">Low</td>
                <td className="p-2">High</td>
                <td className="p-2">✓ Consider adding for resale</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
        <h3 className="font-bold text-purple-900 mb-3">ROI Optimization Guidelines</h3>
        <div className="space-y-3 text-sm text-purple-800">
          <p><strong>Sweet Spot Formula:</strong> Client satisfaction score of 85+ with market appeal score of 80+</p>
          <p><strong>Acceptable Range:</strong> Client 80-100, Market 70-100 (prioritize client slightly)</p>
          <p><strong>Red Flag:</strong> Market appeal below 70 indicates over-personalization risk</p>
          <p><strong>Compromise Strategy:</strong> When conflicts arise, invest in quality execution that appeals to avatars even if feature itself is client-specific</p>
        </div>
      </div>
    </div>
  </div>
);

const WorkflowPhase = ({ phase, title, duration, steps, deliverable }) => (
  <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
    <div className="flex items-start gap-4 mb-4">
      <div className="bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold flex-shrink-0">
        {phase}
      </div>
      <div className="flex-1">
        <h3 className="font-bold text-lg text-gray-800">{title}</h3>
        <p className="text-sm text-gray-500">Duration: {duration}</p>
      </div>
    </div>
    <ul className="space-y-2 mb-4 ml-14">
      {steps.map((step, idx) => (
        <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
          <span className="text-blue-600 mt-1">•</span>
          <span>{step}</span>
        </li>
      ))}
    </ul>
    <div className="ml-14 bg-white p-3 rounded border border-gray-200">
      <p className="text-sm font-semibold text-gray-700">Deliverable: <span className="text-blue-600">{deliverable}</span></p>
    </div>
  </div>
);

const ScoringCategory = ({ title, description, categories }) => (
  <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
    <h3 className="font-bold text-lg mb-2">{title}</h3>
    <p className="text-sm text-gray-600 mb-4">{description}</p>
    <div className="space-y-4">
      {categories.map((cat, idx) => (
        <div key={idx} className="bg-white p-4 rounded border border-gray-200">
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-semibold text-gray-800">{cat.name}</h4>
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
              {cat.weight} points
            </span>
          </div>
          <ul className="space-y-1">
            {cat.criteria.map((criterion, cidx) => (
              <li key={cidx} className="text-sm text-gray-600 flex items-start gap-2">
                <span className="text-blue-600">→</span>
                <span>{criterion}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  </div>
);

const MatchingStep = ({ step, title, description }) => (
  <div className="flex items-start gap-3">
    <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm flex-shrink-0">
      {step}
    </div>
    <div>
      <h4 className="font-semibold text-gray-800">{title}</h4>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  </div>
);

export default Not4SaleWorkflow;